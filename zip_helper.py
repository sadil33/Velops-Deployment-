import os
import zipfile

def zip_project(output_filename):
    # Items to explicitly include (files or folders in the root)
    include_items = [
        'backend',
        'frontend',
        'render.yaml',
        'README.md',
        '.gitignore'
    ]
    
    # directories to exclude
    exclude_dirs = {
        'node_modules', 
        '.git', 
        'Tech_Project_Source', 
        'Tech_Project_Temp', 
        'dist', 
        'build', 
        'coverage', 
        '.vscode', 
        '.idea',
        '__pycache__'
    }
    
    # exact filenames to exclude
    exclude_files = {
        '.DS_Store', 
        'Thumbs.db', 
        '.env', 
        '.env.local', 
        '.env.development', 
        '.env.test', 
        '.env.production'
    }
    
    # extensions to exclude
    exclude_extensions = {'.zip', '.log', '.txt'} 
    # Note: .txt might be too aggressive, but user said "unnecessary". 
    # Let's keep .txt allowed but exclude specific known log files if needed, 
    # or just stick to .log. I'll remove .txt from strict exclusion to be safe 
    # unless it's clearly a log. The user listed error.txt which I saw.
    
    base_dir = os.getcwd()
    zip_path = os.path.join(base_dir, output_filename)
    
    print(f"Creating zip file: {zip_path}")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Iterate over the explicit include list
        for item in include_items:
            item_path = os.path.join(base_dir, item)
            
            if not os.path.exists(item_path):
                print(f"Warning: {item} does not exist, skipping.")
                continue
                
            if os.path.isfile(item_path):
                # Check directly included files against exclusions just in case
                if item in exclude_files or any(item.endswith(ext) for ext in exclude_extensions):
                    print(f"Skipping excluded file: {item}")
                    continue
                    
                print(f"Adding file: {item}")
                zipf.write(item_path, arcname=item)
            else:
                # It's a directory, walk it
                print(f"Testing directory: {item}")
                for root, dirs, files in os.walk(item_path):
                    # Filter out excluded directories
                    # modify dirs in-place to skip walking them
                    dirs[:] = [d for d in dirs if d not in exclude_dirs]
                    
                    for file in files:
                        if file in exclude_files or any(file.endswith(ext) for ext in exclude_extensions):
                            continue
                        
                        # Special check for error.txt as seen in backend
                        if file == 'error.txt':
                            continue
                            
                        file_path = os.path.join(root, file)
                        # Create relative path for archive
                        # The relative path should be relative to the base_dir, so it includes 'backend/...' or 'frontend/...'
                        arcname = os.path.relpath(file_path, base_dir)
                        zipf.write(file_path, arcname=arcname)
                        
    print("Zip creation complete.")

if __name__ == "__main__":
    zip_project('Velops_Project_Clean.zip')
