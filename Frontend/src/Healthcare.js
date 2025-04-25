import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Healthcare.css'; // Assuming you'll create this CSS file

const Healthcare = () => {
  // Wallet and contract states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(null);
  
  // User type tracking
  const [userType, setUserType] = useState('visitor'); // visitor, patient, doctor, admin

  // Form states
  const [providerAddress, setProviderAddress] = useState("");
  const [patientID, setPatientID] = useState('');
  const [patientRecords, setPatientRecords] = useState([]);
  const [doctors, setDoctors] = useState({});
  
  // Patient registration
  const [patientName, setPatientName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [insured, setInsured] = useState(false);
  
  // Doctor registration
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [doctorAddress, setDoctorAddress] = useState('');
  
  // Record addition
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medication, setMedication] = useState('');
  const [treatmentCost, setTreatmentCost] = useState('');
  const [followUp, setFollowUp] = useState(false);
  
  // View control
  const [activeView, setActiveView] = useState('home'); // home, patient, doctor, records
  const [myPatientID, setMyPatientID] = useState(null);
  const [myDoctorID, setMyDoctorID] = useState(null);

  const ContractAddress = '0x14b9f613f34b6d2e668d8cb9e1d769a695651f48'; // Replace with your deployed contract address

  const contractABI = [
    
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "medication",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "treatmentCost",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "followUpRequired",
                    "type": "bool"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "doctorID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "specialization",
                    "type": "string"
                }
            ],
            "name": "DoctorRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "PatientRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "ProviderAuthorized",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "recordID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "doctorID",
                    "type": "uint256"
                }
            ],
            "name": "RecordAdded",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "specialization",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "doctorAddress",
                    "type": "address"
                }
            ],
            "name": "registerDoctor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "dateOfBirth",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "bloodType",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "insured",
                    "type": "bool"
                }
            ],
            "name": "registerPatient",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "doctorID",
                    "type": "uint256"
                }
            ],
            "name": "getDoctorInfo",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "doctorID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "specialization",
                            "type": "string"
                        },
                        {
                            "internalType": "bool",
                            "name": "active",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Doctor",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMyDoctorID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMyPatientID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientInfo",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "patientID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "dateOfBirth",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "bloodType",
                            "type": "string"
                        },
                        {
                            "internalType": "bool",
                            "name": "insured",
                            "type": "bool"
                        },
                        {
                            "internalType": "address",
                            "name": "patientAddress",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Patient",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "patientID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "doctorID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "medication",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "treatmentCost",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "followUpRequired",
                            "type": "bool"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "isAuthorized",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    
  ];

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('No wallet detected. Please install MetaMask.');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const accountAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(accountAddress);

        const contract = new ethers.Contract(ContractAddress, contractABI, signer);
        setContract(contract);

        // Get owner and check if connected account is owner
        const ownerAddress = await contract.getOwner();
        const isAccountOwner = accountAddress.toLowerCase() === ownerAddress.toLowerCase();
        setIsOwner(isAccountOwner);
        
        if (isAccountOwner) {
          setUserType('admin');
          setIsAuthorized(true);
        } else {
          // Check if authorized
          const authorized = await contract.isAuthorized(accountAddress);
          setIsAuthorized(authorized);
          
          // Check if user is a patient
          try {
            const myPatientID = await contract.getMyPatientID();
            if (myPatientID > 0) {
              setMyPatientID(myPatientID.toNumber());
              setPatientID(myPatientID.toNumber());
              setUserType('patient');
            }
          } catch (e) {
            console.log("Not registered as patient");
          }
          
          // Check if user is a doctor
          try {
            const myDoctorID = await contract.getMyDoctorID();
            if (myDoctorID > 0) {
              setMyDoctorID(myDoctorID.toNumber());
              setUserType('doctor');
            }
          } catch (e) {
            console.log("Not registered as doctor");
          }
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        setError(error.message || 'Failed to connect to wallet');
      }
    };

    connectWallet();
  }, []);

  const authorizeProvider = async () => {
    if (isOwner) {
      try {
        const tx = await contract.authorizeProvider(providerAddress);
        await tx.wait();
        alert(`Provider ${providerAddress} authorized successfully!`);
      } catch (error) {
        console.error("Error authorizing provider:", error);
        alert("Error authorizing provider: " + error.message);
      }
    } else {
      alert("Only contract owner can authorize providers");
    }
  };

  const registerPatient = async () => {
    try {
      // Convert date string to timestamp
      const dobTimestamp = new Date(dateOfBirth).getTime() / 1000;
      const tx = await contract.registerPatient(patientName, dobTimestamp, bloodType, insured);
      await tx.wait();
      alert(`Patient ${patientName} registered successfully!`);
      
      // Update states
      const myPatientID = await contract.getMyPatientID();
      setMyPatientID(myPatientID.toNumber());
      setPatientID(myPatientID.toNumber());
      setUserType('patient');
      setActiveView('patient');
    } catch (error) {
      console.error("Error registering patient:", error);
      alert("Error registering patient: " + error.message);
    }
  };

  const registerDoctor = async () => {
    if (isOwner) {
      try {
        const tx = await contract.registerDoctor(doctorName, specialization, doctorAddress);
        await tx.wait();
        alert(`Doctor ${doctorName} registered successfully!`);
      } catch (error) {
        console.error("Error registering doctor:", error);
        alert("Error registering doctor: " + error.message);
      }
    } else {
      alert("Only contract owner can register doctors");
    }
  };

  const fetchPatientRecords = async () => {
    try {
      const records = await contract.getPatientRecords(patientID);
      console.log("Fetched records:", records);
      
      // Fetch doctor info for each record
      const recordsWithDoctorInfo = await Promise.all(records.map(async (record) => {
        const doctorID = record.doctorID.toNumber();
        let doctorInfo = doctors[doctorID];
        
        if (!doctorInfo) {
          try {
            doctorInfo = await contract.getDoctorInfo(doctorID);
            setDoctors(prev => ({...prev, [doctorID]: doctorInfo}));
          } catch (e) {
            doctorInfo = { name: "Unknown", specialization: "Unknown" };
          }
        }
        
        return {
          ...record,
          doctorName: doctorInfo.name,
          doctorSpecialization: doctorInfo.specialization
        };
      }));
      
      setPatientRecords(recordsWithDoctorInfo);
      setActiveView('records');
    } catch (error) {
      console.error('Error fetching patient records:', error);
      alert("Error fetching records: " + error.message);
    }
  };
  
  const addRecord = async () => {
    if (!isAuthorized) {
      alert("You must be an authorized provider to add records");
      return;
    }
    
    try {
      const tx = await contract.addRecord(
        patientID,
        diagnosis,
        treatment,
        medication,
        ethers.utils.parseEther(treatmentCost || "0"),
        followUp
      );
      
      await tx.wait();
      alert("Record added successfully!");
      fetchPatientRecords();
      
      // Clear form
      setDiagnosis('');
      setTreatment('');
      setMedication('');
      setTreatmentCost('');
      setFollowUp(false);
    } catch (error) {
      console.error('Error adding record:', error);
      alert("Error adding record: " + error.message);
    }
  };

  // Render different views based on user type and active view
  const renderContent = () => {
    // Home view with login instructions
    if (activeView === 'home') {
      return (
        <div className="welcome-section">
          <h2>Welcome to Healthcare Blockchain Records</h2>
          <p>This application securely stores and manages healthcare records on the blockchain.</p>
          
          {!account && <p>Please connect your wallet to get started.</p>}
          
          {account && userType === 'visitor' && (
            <div className="registration-options">
              <button className="primary-button" onClick={() => setActiveView('registerPatient')}>Register as Patient</button>
              <p>Healthcare providers: Please contact the administrator to get registered.</p>
            </div>
          )}
          
          {account && userType === 'patient' && (
            <div className="patient-options">
              <p>You are registered as a patient (ID: {myPatientID})</p>
              <button className="primary-button" onClick={() => {
                setPatientID(myPatientID);
                fetchPatientRecords();
              }}>View My Records</button>
            </div>
          )}
          
          {account && userType === 'doctor' && (
            <div className="doctor-options">
              <p>You are registered as a healthcare provider (Doctor ID: {myDoctorID})</p>
              <button className="primary-button" onClick={() => setActiveView('recordManagement')}>Manage Patient Records</button>
            </div>
          )}
          
          {account && userType === 'admin' && (
            <div className="admin-options">
              <p>You are the system administrator</p>
              <button className="primary-button" onClick={() => setActiveView('adminPanel')}>Admin Panel</button>
            </div>
          )}
        </div>
      );
    }
    
    // Patient registration view
    if (activeView === 'registerPatient') {
      return (
        <div className="form-section">
          <h2>Patient Registration</h2>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Date of Birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Blood Type</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="input-group checkbox">
            <label>
              <input type="checkbox" checked={insured} onChange={(e) => setInsured(e.target.checked)} />
              Health Insurance Coverage
            </label>
          </div>
          <div className="button-group">
            <button className="primary-button" onClick={registerPatient}>Register</button>
            <button className="secondary-button" onClick={() => setActiveView('home')}>Cancel</button>
          </div>
        </div>
      );
    }
    
    // Admin panel view
    if (activeView === 'adminPanel') {
      return (
        <div className="admin-panel">
          <h2>Administrator Panel</h2>
          
          <div className="form-section">
            <h3>Authorize Provider</h3>
            <div className="input-group">
              <label>Provider Wallet Address</label>
              <input type="text" value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} placeholder="0x..." />
            </div>
            <button className="primary-button" onClick={authorizeProvider}>Authorize Provider</button>
          </div>
          
          <div className="form-section">
            <h3>Register Doctor</h3>
            <div className="input-group">
              <label>Doctor Name</label>
              <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Specialization</label>
              <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Doctor Wallet Address</label>
              <input type="text" value={doctorAddress} onChange={(e) => setDoctorAddress(e.target.value)} placeholder="0x..." />
            </div>
            <button className="primary-button" onClick={registerDoctor}>Register Doctor</button>
          </div>
          
          <div className="form-section">
            <h3>View Patient Records</h3>
            <div className="input-group">
              <label>Patient ID</label>
              <input type="number" value={patientID} onChange={(e) => setPatientID(e.target.value)} />
            </div>
            <button className="primary-button" onClick={fetchPatientRecords}>Fetch Records</button>
          </div>
          
          <button className="secondary-button back-button" onClick={() => setActiveView('home')}>Back to Home</button>
        </div>
      );
    }
    
    // Record management view for doctors
    if (activeView === 'recordManagement') {
      return (
        <div className="record-management">
          <h2>Patient Record Management</h2>
          
          <div className="form-section">
            <h3>Fetch Patient Records</h3>
            <div className="input-group">
              <label>Patient ID</label>
              <input type="number" value={patientID} onChange={(e) => setPatientID(e.target.value)} />
            </div>
            <button className="primary-button" onClick={fetchPatientRecords}>Fetch Records</button>
          </div>
          
          <div className="form-section">
            <h3>Add Medical Record</h3>
            <div className="input-group">
              <label>Patient ID</label>
              <input type="number" value={patientID} onChange={(e) => setPatientID(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Diagnosis</label>
              <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Treatment</label>
              <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Medication</label>
              <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Treatment Cost (ETH)</label>
              <input type="text" value={treatmentCost} onChange={(e) => setTreatmentCost(e.target.value)} />
            </div>
            <div className="input-group checkbox">
              <label>
                <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
                Follow-up Required
              </label>
            </div>
            <button className="primary-button" onClick={addRecord}>Add Record</button>
          </div>
          
          <button className="secondary-button back-button" onClick={() => setActiveView('home')}>Back to Home</button>
        </div>
      );
    }
    
    // Records display view
    if (activeView === 'records') {
      return (
        <div className="records-section">
          <h2>Patient Records (ID: {patientID})</h2>
          
          {patientRecords.length === 0 ? (
            <p>No records found for this patient.</p>
          ) : (
            <div className="records-list">
              {patientRecords.map((record, index) => (
                <div key={index} className="record-card">
                  <div className="record-header">
                    <h3>Record #{record.recordID.toString()}</h3>
                    <span className="timestamp">{new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</span>
                  </div>
                  <div className="doctor-info">
                    <p><strong>Doctor:</strong> {record.doctorName} ({record.doctorSpecialization})</p>
                  </div>
                  <div className="record-body">
                    <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                    <p><strong>Treatment:</strong> {record.treatment}</p>
                    <p><strong>Medication:</strong> {record.medication}</p>
                    <p><strong>Cost:</strong> {ethers.utils.formatEther(record.treatmentCost)} ETH</p>
                    <p><strong>Follow-up:</strong> {record.followUpRequired ? "Required" : "Not Required"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isAuthorized && (
            <div className="quick-add">
              <h3>Quick Add Record</h3>
              <div className="input-group">
                <label>Diagnosis</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Treatment</label>
                <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Medication</label>
                <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} />
              </div>
              <div className="button-group">
                <button className="primary-button" onClick={addRecord}>Add Record</button>
              </div>
            </div>
          )}
          
          <button className="secondary-button back-button" onClick={() => setActiveView('home')}>Back to Home</button>
        </div>
      );
    }
  };

  return (
    <div className="healthcare-container">
      <header className="app-header">
        <h1>Blockchain Healthcare Records</h1>
        <div className="account-info">
          {account ? (
            <div>
              <span className="connected-status">Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              {isOwner && <span className="owner-badge">Admin</span>}
              {isAuthorized && !isOwner && <span className="provider-badge">Provider</span>}
              {userType === 'patient' && <span className="patient-badge">Patient #{myPatientID}</span>}
            </div>
          ) : (
            <span className="disconnected-status">Wallet not connected</span>
          )}
        </div>
      </header>
      
      <main className="app-content">
        {error && <div className="error-message">{error}</div>}
        {renderContent()}
      </main>
      
      <footer className="app-footer">
        <p>Healthcare Blockchain Records © 2023</p>
      </footer>
    </div>
  );
};

export default Healthcare;