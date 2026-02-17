import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileUp, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [tenantUrl, setTenantUrl] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [connectionError, setConnectionError] = useState(false); // New state for full page error

    // Login Type State
    const [loginType, setLoginType] = useState('PMO'); // 'PMO' or 'Velops'
    const [velopsPassword, setVelopsPassword] = useState('');

    // File Drop State
    const [droppedFile, setDroppedFile] = useState(null);
    const [parsedConfig, setParsedConfig] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const ssoChecked = useRef(false);

    useEffect(() => {
        if (ssoChecked.current) return;
        ssoChecked.current = true;

        const checkSSO = async () => {
            const params = new URLSearchParams(window.location.search);
            const hasCode = params.get('code');
            const hasError = params.get('error') || params.get('access_denied');

            if (hasError) {
                navigate('/404', { state: { message: "Please check the login once" } });
                return;
            }

            if (hasCode) {
                // User authorized
                try {
                    // Restore config from session storage
                    const storedConfig = sessionStorage.getItem('ion_config');
                    const storedLoginType = sessionStorage.getItem('login_type') || 'PMO';

                    if (storedConfig) {
                        const config = JSON.parse(storedConfig);
                        // Construct Token Endpoint: pu + ot
                        // Ensure pu ends with slash or ot starts with one if needed, but usually pu has trailing slash
                        const tokenEndpoint = config.pu + config.ot;

                        // Exchange Code for Token via Backend
                        const apiUrl = "http://localhost:5000";
                        const redirectUri = config.ru || window.location.origin;
                        console.log("Exchanging code for token...and the url is", apiUrl);
                        console.log("Using redirectUri:", redirectUri);

                        const tokenRes = await axios.post(`${apiUrl}/api/auth/token`, {
                            clientId: config.ci,
                            clientSecret: config.cs,
                            code: hasCode,
                            redirectUri: redirectUri,
                            tokenUrl: tokenEndpoint
                        });

                        const { access_token } = tokenRes.data;

                        if (!access_token) {
                            throw new Error("No access token returned");
                        }

                        // Construct proper Tenant URL: https://mingle-ionapi.inforcloudsuite.com/{TenantName}/
                        // "iu" is the base ionapi url, "ti" is the tenant id
                        const tenantUrl = `${config.iu}/${config.ti}/`;

                        // Fetch Real User Details
                        let userData = {
                            response: {
                                userlist: [{ DisplayName: 'Infor User', Email: 'user@example.com' }]
                            }
                        };

                        try {
                            const userRes = await axios.post(`${apiUrl}/api/proxy`, {
                                tenantUrl: tenantUrl,
                                endpoint: 'ifsservice/usermgt/v2/users/me',
                                token: access_token,
                                method: 'GET'
                            });

                            if (userRes.status === 200 && userRes.data) {
                                if (userRes.data.response && userRes.data.response.userlist) {
                                    userData = userRes.data;
                                } else {
                                    userData = {
                                        response: {
                                            userlist: [userRes.data]
                                        }
                                    };
                                }
                            }
                        } catch (err) {
                            console.warn("Failed to fetch user details, using fallback", err);
                        }

                        login(tenantUrl, access_token, userData, storedLoginType);
                        navigate('/prerequisites');
                    } else {
                        // If no config found (unexpected), show login
                        setShowLogin(true);
                    }
                } catch (e) {
                    console.error("SSO Handle Error", e);
                    setError(`SSO Login Failed: ${e.message}`); // Show error to user
                    setShowLogin(true);
                }

                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // Not authorized yet
                setShowLogin(true);
            }
        };

        checkSSO();
    }, [navigate, login]);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                // Basic validation
                if (json.ti && json.ci && json.pu && json.oa) {
                    setParsedConfig(json);
                    setDroppedFile(file);
                    setError(null);
                } else {
                    setError("Invalid .ionapi file format. Missing required fields.");
                }
            } catch (err) {
                setError("Failed to parse the file. Please ensure it's a valid JSON.");
            }
        };
        reader.readAsText(file);
    };

    const handleRemoveFile = () => {
        setDroppedFile(null);
        setParsedConfig(null);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json', '.ionapi'],
            'text/plain': ['.txt']
        },
        maxFiles: 1
    });

    const handleSSORedirect = () => {
        if (!parsedConfig) return;

        const { pu, oa, ci, ru } = parsedConfig;

        // Save config for the return trip
        sessionStorage.setItem('ion_config', JSON.stringify(parsedConfig));
        sessionStorage.setItem('login_type', loginType);

        if (loginType === 'Velops' && velopsPassword !== 'LetmeinVelops') {
            setError('Invalid Velops Password');
            return;
        }

        // Strict construction as per user algorithm
        const ssoBaseUrl = pu;
        const authEndpoint = oa;
        const clientId = ci;
        const responseType = "code";

        // Use 'ru' from file if available, otherwise default to current origin
        const redirectUri = ru || window.location.origin;

        const authUrl = `${ssoBaseUrl}${authEndpoint}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}`;

        console.log("---------------------------------------------------------");
        console.log("FINAL AUTH URL:", authUrl);
        console.log("---------------------------------------------------------");

        // Redirect
        window.location.href = authUrl;
    };

    const handleDenyConnect = () => {
        // "if don't allow then it should show the 404 not found with a message please check the login once"
        navigate('/404', { state: { message: "Please check the login once" } });
    };

    const handleManualConnect = async () => {
        if (!tenantUrl || !token) {
            setError('Please provide both Tenant URL and Access Token');
            return;
        }

        if (loginType === 'Velops' && velopsPassword !== 'LetmeinVelops') {
            setError('Invalid Velops Password');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Validate connection (Changed to ifsservice/info as requested)
            const endpoint = 'ifsservice/info';
            const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
            const res = await axios.post(`${apiUrl}/api/proxy`, {
                tenantUrl,
                endpoint,
                token,
                method: 'GET'
            });

            if (res.status === 200) {
                // Check if response is HTML (Unexpected for API)
                const isHtml = typeof res.data === 'string' && res.data.trim().startsWith('<');

                if (isHtml) {
                    console.error("Received HTML response instead of JSON");
                    setConnectionError(true);
                    return;
                }

                // If successful (200 OK), try to fetch detailed user info
                let userData = res.data;

                try {
                    // Fetch accurate user details
                    const userRes = await axios.post(`${apiUrl}/api/proxy`, {
                        tenantUrl,
                        endpoint: 'ifsservice/usermgt/v2/users/me',
                        token,
                        method: 'GET'
                    });

                    if (userRes.status === 200 && userRes.data) {
                        // Reshape data if needed to match AuthContext expectation
                        if (userRes.data.response && userRes.data.response.userlist) {
                            userData = userRes.data;
                        } else {
                            userData = {
                                response: {
                                    userlist: [userRes.data]
                                }
                            };
                        }
                    }
                } catch (userErr) {
                    console.warn("Could not fetch user details, using generic info", userErr);
                    // Fallback to existing data if this fails, though likely generic
                }

                login(tenantUrl, token, userData, loginType);
                navigate('/prerequisites');
            } else {
                // If not 200 (unexpected), show error page
                setConnectionError(true);
            }

        } catch (err) {
            console.error("Connection Error:", err);
            // On any error (404, 500, Network), show the Error Page
            setConnectionError(true);
        } finally {
            setLoading(false);
        }
    };

    // Full Page Error View
    if (connectionError) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="inline-flex items-center justify-center p-6 bg-red-500/20 rounded-full mb-6 relative">
                        {/* Alert Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /></svg>
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                    </div>

                    <h1 className="text-6xl font-black text-white mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-slate-300 mb-6">Connection Failed</h2>

                    <p className="text-slate-400 mb-8 font-medium">
                        Please check the url and access token.
                    </p>

                    <Button
                        onClick={() => {
                            setConnectionError(false);
                            setError(null); // Reset inline error
                        }}
                        className="mx-auto w-auto px-8"
                    >
                        Retry Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!showLogin) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-infor-red border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white font-bold animate-pulse">Loading Secure Sign On...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4 selection:bg-infor-red selection:text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full relative"
            >
                {/* Decorative glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-infor-red/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="text-center mb-10 relative z-10">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center justify-center gap-2 mb-4 bg-white/5 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg"
                    >
                        <ShieldCheck className="w-3 h-3 text-infor-red" />
                        <span>Secure Gateway</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-2 flex justify-center gap-1">
                        <span className="text-infor-red">Infor</span>
                        <span>Portal</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">Connect to your enterprise tenant</p>
                </div>

                <div className="glass-panel rounded-3xl shadow-2xl shadow-black/50 p-8 flex flex-col gap-6 backdrop-blur-3xl border border-white/10 relative z-10 bg-slate-900/60">

                    {/* Common Login Type Selection - Visible for ALL methods */}
                    <div className="space-y-4 border-b border-white/10 pb-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300 ml-1">Login Type</label>
                            <select
                                value={loginType}
                                onChange={(e) => setLoginType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-500"
                            >
                                <option value="PMO">PMO Login</option>
                                <option value="Velops">Velops Login</option>
                            </select>
                        </div>

                        {loginType === 'Velops' && (
                            <Input
                                label="Velops Password"
                                placeholder="Enter password..."
                                value={velopsPassword}
                                onChange={(e) => setVelopsPassword(e.target.value)}
                                type="password"
                            />
                        )}
                    </div>

                    {/* Dropzone Area */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${isDragActive
                            ? 'border-infor-red bg-infor-red/10'
                            : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-slate-200">
                            {/* Change icon if file present */}
                            {droppedFile ? (
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-pulse" />
                            ) : (
                                <FileUp className={`w-8 h-8 ${isDragActive ? 'text-infor-red animate-bounce' : ''}`} />
                            )}

                            <p className="text-sm font-medium">
                                {droppedFile
                                    ? "Config Loaded! Drop a different file to replace."
                                    : isDragActive ? "Drop the .ionapi file here..." : "Drop your .ionapi file here to auto-connect"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Preview OR Manual Inputs */}
                    {droppedFile && parsedConfig ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-infor-red/20 rounded-lg text-infor-red flex-shrink-0">
                                    <FileUp className="w-6 h-6" />
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{droppedFile.name}</p>
                                    <p className="text-slate-400 text-xs truncate">Tenant: {parsedConfig.ti}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0"
                                title="Remove File"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* OR Separator */}
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-700"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase">Or Manual Login</span>
                                <div className="flex-grow border-t border-slate-700"></div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Tenant URL"
                                    placeholder="https://mingle-ionapi.inforcloudsuite.com/TENANTID/"
                                    value={tenantUrl}
                                    onChange={(e) => setTenantUrl(e.target.value)}
                                />

                                <Input
                                    label="Access Token"
                                    placeholder="Type your secure token..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    type="password"
                                />
                            </div>
                        </>
                    )}



                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-white text-sm bg-infor-red/80 p-4 rounded-xl border border-red-500/50 backdrop-blur-sm shadow-lg font-medium flex items-center gap-2"
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <Button
                        onClick={droppedFile ? handleSSORedirect : handleManualConnect}
                        loading={loading}
                        className={droppedFile ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20" : ""}
                    >
                        {droppedFile ? "Connect Securely (SSO)" : "Connect Securely"}
                    </Button>

                    <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium">Protected by Enterprise Grade Security</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
