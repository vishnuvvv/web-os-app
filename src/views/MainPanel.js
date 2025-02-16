import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@enact/sandstone/Button';
import { Panel, Header } from '@enact/sandstone/Panels';
import Spinner from '@enact/sandstone/Spinner';
import axios from 'axios';
import io from 'socket.io-client';

const MainPanel = () => {
  const [pairCode, setPairCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [socketID, setSocketID] = useState(null);

  const socketRef = useRef(null); 
  const sidRef = useRef(null); // ✅ Ref to update SID dynamically in a <p> tag

  // Fetch pair code without disconnecting the socket
  const fetchPairCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://qa.api.astacms.com/api/pair-code?oldCode=');
      setPairCode(response.data.data.code);
    } catch (err) {
      setError('Failed to fetch pair code');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket and persist connection
  const connectSocket = useCallback(() => {
    if (pairCode && !socketRef.current) {
      socketRef.current = io('https://api.astacms.com/server-namespace', {
        query: { pairCode },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        setSocketStatus('Connected to Server');
        setSocketID(socketRef.current.id);
        if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${socketRef.current.id}`;
      });

      socketRef.current.on('disconnect', () => {
        setSocketStatus('Disconnected from Server');
        setSocketID(null);
        if (sidRef.current) sidRef.current.textContent = 'Socket ID (SID): Not Connected';
      });

      socketRef.current.on('connect_error', () => {
        setSocketStatus('Failed to connect to the server');
      });

      // Listen for any SID change dynamically
      socketRef.current.on('sid-update', (newSID) => {
        setSocketID(newSID);
        if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${newSID}`;
      });
    }
  }, [pairCode]);

  // Reconnect socket when pairCode changes
  useEffect(() => {
    // Disconnect existing socket and reconnect when pairCode changes
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Only reconnect when pairCode is available
    if (pairCode) {
      connectSocket();
    }
  }, [pairCode, connectSocket]);

  // Fetch pair code on mount and refresh
  useEffect(() => {
    fetchPairCode();
  }, [fetchPairCode]);

  // Refresh only updates the pair code, socket remains untouched
  const handleRefresh = () => {
    fetchPairCode();
  };

  return (
    <div style={styles.pageContainer}>
      <Panel style={styles.panel}>
        <h1 style={styles.header}>Pair Code Fetcher</h1>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <>
            <div style={styles.pairCodeText}>
              Pair Code: <strong>{pairCode}</strong>
            </div>
            <Button onClick={handleRefresh} style={styles.button}>
              Refresh
            </Button>
            <div style={styles.socketStatus}>
              Socket Status: <strong>{socketStatus}</strong>
            </div>
            <p ref={sidRef} style={styles.socketID}>
              Socket ID (SID): {socketID || 'Not Connected'}
            </p>
          </>
        )}
      </Panel>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#008080', // Teal background
    padding: '20px',
  },
  panel: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center', // Center text
  },
  header: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#777',
  },
  pairCodeText: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 24px',
    fontSize: '18px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
    width: '100%',
  },
  socketStatus: {
    fontSize: '18px',
    marginTop: '20px',
    color: '#333',
  },
  socketID: {
    fontSize: '14px',
    color: '#6c757d',
  },
  error: {
    color: 'red',
    marginTop: '10px',
    fontSize: '16px',
  },
};

export default MainPanel;


// import { useState, useEffect, useCallback, useRef } from 'react';
// import Button from '@enact/sandstone/Button';
// import { Panel, Header } from '@enact/sandstone/Panels';
// import Spinner from '@enact/sandstone/Spinner';
// import axios from 'axios';
// import io from 'socket.io-client';

// const MainPanel = () => {
//   const [pairCode, setPairCode] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [socketStatus, setSocketStatus] = useState('Disconnected');
//   const [socketID, setSocketID] = useState(null);

//   const socketRef = useRef(null); 
//   const sidRef = useRef(null); // ✅ Ref to update SID dynamically in a <p> tag

//   // Fetch pair code without disconnecting the socket
//   const fetchPairCode = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get('https://qa.api.astacms.com/api/pair-code?oldCode=');
//       setPairCode(response.data.data.code);
//     } catch (err) {
//       setError('Failed to fetch pair code');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Initialize WebSocket and persist connection
//   const connectSocket = useCallback(() => {
//     if (pairCode && !socketRef.current) {
//       socketRef.current = io('https://api.astacms.com/server-namespace', {
//         query: { pairCode },
//         transports: ['websocket'],
//       });

//       socketRef.current.on('connect', () => {
//         setSocketStatus('Connected to Server');
//         setSocketID(socketRef.current.id);
//         if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${socketRef.current.id}`;
//       });

//       socketRef.current.on('disconnect', () => {
//         setSocketStatus('Disconnected from Server');
//         setSocketID(null);
//         if (sidRef.current) sidRef.current.textContent = 'Socket ID (SID): Not Connected';
//       });

//       socketRef.current.on('connect_error', () => {
//         setSocketStatus('Failed to connect to the server');
//       });

//       // Listen for any SID change dynamically
//       socketRef.current.on('sid-update', (newSID) => {
//         setSocketID(newSID);
//         if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${newSID}`;
//       });
//     }
//   }, [pairCode]);

//   // Reconnect socket when pairCode changes
//   useEffect(() => {
//     // Disconnect existing socket and reconnect when pairCode changes
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }

//     // Only reconnect when pairCode is available
//     if (pairCode) {
//       connectSocket();
//     }
//   }, [pairCode, connectSocket]);

//   // Fetch pair code on mount and refresh
//   useEffect(() => {
//     fetchPairCode();
//   }, [fetchPairCode]);

//   // Refresh only updates the pair code, socket remains untouched
//   const handleRefresh = () => {
//     fetchPairCode();
//   };

//   return (
//     <Panel style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
//       <Header title="Pair Code Fetcher" style={{ marginBottom: '10px' }} />
//       {loading ? (
//         <Spinner />
//       ) : error ? (
//         <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
//       ) : (
//         <>
//           <div style={{ fontSize: '16px', marginBottom: '10px' }}>
//             Pair Code: <strong>{pairCode}</strong>
//           </div>
//           <Button
//             onClick={handleRefresh}
//             style={{
//               backgroundColor: '#007bff',
//               color: 'white',
//               padding: '10px 20px',
//               fontSize: '16px',
//               borderRadius: '5px',
//               marginBottom: '10px',
//               cursor: 'pointer',
//             }}
//           >
//             Refresh
//           </Button>
//           <div style={{ fontSize: '16px', marginTop: '10px' }}>
//             Socket Status: <strong>{socketStatus}</strong>
//           </div>
//           <p ref={sidRef} style={{ fontSize: '14px', color: '#6c757d' }}>
//             Socket ID (SID): {socketID || 'Not Connected'}
//           </p>
//         </>
//       )}
//     </Panel>
//   );
// };

// export default MainPanel;


// import { useState, useEffect, useCallback, useRef } from 'react';
// import Button from '@enact/sandstone/Button';
// import { Panel, Header } from '@enact/sandstone/Panels';
// import Spinner from '@enact/sandstone/Spinner';
// import axios from 'axios';
// import io from 'socket.io-client';

// const MainPanel = () => {
//   const [pairCode, setPairCode] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [socketStatus, setSocketStatus] = useState('Disconnected');
//   const [socketID, setSocketID] = useState(null);

//   const socketRef = useRef(null); 
//   const sidRef = useRef(null); // ✅ Ref to update SID dynamically in a <p> tag

//   // Fetch pair code without disconnecting the socket
//   const fetchPairCode = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get('https://qa.api.astacms.com/api/pair-code?oldCode=');
//       setPairCode(response.data.data.code);
//     } catch (err) {
//       setError('Failed to fetch pair code');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Initialize WebSocket and persist connection
//   const connectSocket = useCallback(() => {
//     if (pairCode && !socketRef.current) {
//       socketRef.current = io('https://api.astacms.com/server-namespace', {
//         query: { pairCode },
//         transports: ['websocket'],
//       });

//       socketRef.current.on('connect', () => {
//         setSocketStatus('Connected to Server');
//         setSocketID(socketRef.current.id);
//         if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${socketRef.current.id}`;
//       });

//       socketRef.current.on('disconnect', () => {
//         setSocketStatus('Disconnected from Server');
//         setSocketID(null);
//         if (sidRef.current) sidRef.current.textContent = 'Socket ID (SID): Not Connected';
//       });

//       socketRef.current.on('connect_error', () => {
//         setSocketStatus('Failed to connect to the server');
//       });

//       // Listen for any SID change dynamically
//       socketRef.current.on('sid-update', (newSID) => {
//         setSocketID(newSID);
//         if (sidRef.current) sidRef.current.textContent = `Socket ID (SID): ${newSID}`;
//       });
//     }
//   }, [pairCode]);

//   // Reconnect socket when pairCode changes
//   useEffect(() => {
//     // Disconnect existing socket and reconnect when pairCode changes
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }

//     // Only reconnect when pairCode is available
//     if (pairCode) {
//       connectSocket();
//     }
//   }, [pairCode, connectSocket]);

//   // Fetch pair code on mount and refresh
//   useEffect(() => {
//     fetchPairCode();
//   }, [fetchPairCode]);

//   // Refresh only updates the pair code, socket remains untouched
//   const handleRefresh = () => {
//     fetchPairCode();
//   };

//   return (
//     <Panel>
//       <Header title="Pair Code Fetcher" />
//       {loading ? (
//         <Spinner />
//       ) : error ? (
//         <div>{error}</div>
//       ) : (
//         <>
//           <div>Pair Code: {pairCode}</div>
//           {/* <Button onClick={handleRefresh}>Refresh</Button> */}
//           <Button onClick={handleRefresh}>Refresh</Button>
//           <div>Socket Status: {socketStatus}</div>
//           <p ref={sidRef}>Socket ID (SID): {socketID || 'Not Connected'}</p> {/* ✅ Dynamically updates SID */}
//         </>
//       )}
//     </Panel>
//   );
// };

// export default MainPanel;