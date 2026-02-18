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
    
    # directories to exclude (if found inside included folders)
    exclude_dirs = {'node_modules', '.git', 'Tech_Project_Source', 'Tech_Project_Temp'}
    
    # files to exclude (extensions or specific names)
    exclude_files = {'.DS_Store', 'Thumbs.db'}
    
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
                # It's a file, just add it
                print(f"Adding file: {item}")
                zipf.write(item_path, arcname=item)
            else:
                # It's a directory, walk it
                print(f"Adding directory: {item}")
                for root, dirs, files in os.walk(item_path):
                    # Filter out excluded directories
                    # modify dirs in-place to skip walking them
                    dirs[:] = [d for d in dirs if d not in exclude_dirs]
                    
                    for file in files:
                        if file in exclude_files or file.endswith('.zip'):
                            continue
                            
                        file_path = os.path.join(root, file)
                        # Create relative path for archive
                        arcname = os.path.relpath(file_path, base_dir)
                        zipf.write(file_path, arcname=arcname)
                        
    print("Zip creation complete.")

if __name__ == "__main__":
    zip_project('Velops_Project_Clean.zip')
