// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HealthcareRecords {
    address owner;

    struct Doctor {
        uint256 doctorID;
        string name;
        string specialization;
        bool active;
    }

    struct Patient {
        uint256 patientID;
        string name;
        uint256 dateOfBirth;
        string bloodType;
        bool insured;
        address patientAddress;
    }

    struct Record {
        uint256 recordID;
        uint256 patientID;
        uint256 doctorID;
        string diagnosis;
        string treatment;
        string medication;
        uint256 treatmentCost;
        bool followUpRequired;
        uint256 timestamp;
    }

    // Mappings
    mapping(uint256 => Record[]) private patientRecords;
    mapping(uint256 => Patient) private patients;
    mapping(uint256 => Doctor) private doctors;
    mapping(address => bool) private authorizedProviders;
    mapping(address => uint256) private providerToDoctorID;
    mapping(address => uint256) private addressToPatientID;
    
    // Counters
    uint256 private doctorCounter = 0;
    uint256 private patientCounter = 0;

    // Events
    event RecordAdded(uint256 patientID, uint256 recordID, uint256 doctorID);
    event ProviderAuthorized(address provider);
    event PatientRegistered(uint256 patientID, string name);
    event DoctorRegistered(uint256 doctorID, string name, string specialization);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this function");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedProviders[owner] = true; // Owner is automatically authorized
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function authorizeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
        emit ProviderAuthorized(provider);
    }

    function registerDoctor(string memory name, string memory specialization, address doctorAddress) public onlyOwner {
        doctorCounter++;
        doctors[doctorCounter] = Doctor(doctorCounter, name, specialization, true);
        authorizedProviders[doctorAddress] = true;
        providerToDoctorID[doctorAddress] = doctorCounter;
        emit DoctorRegistered(doctorCounter, name, specialization);
    }

    function registerPatient(string memory name, uint256 dateOfBirth, string memory bloodType, bool insured) public {
        patientCounter++;
        patients[patientCounter] = Patient(patientCounter, name, dateOfBirth, bloodType, insured, msg.sender);
        addressToPatientID[msg.sender] = patientCounter;
        emit PatientRegistered(patientCounter, name);
    }

    function addRecord(
        uint256 patientID, 
        string memory diagnosis, 
        string memory treatment, 
        string memory medication, 
        uint256 treatmentCost, 
        bool followUpRequired
    ) public onlyAuthorizedProvider {
        uint256 doctorID = providerToDoctorID[msg.sender];
        require(doctorID > 0, "Doctor not registered");
        
        uint256 recordID = patientRecords[patientID].length + 1;
        patientRecords[patientID].push(
            Record(
                recordID, 
                patientID, 
                doctorID, 
                diagnosis, 
                treatment, 
                medication, 
                treatmentCost, 
                followUpRequired, 
                block.timestamp
            )
        );
        
        emit RecordAdded(patientID, recordID, doctorID);
    }

    function getPatientRecords(uint256 patientID) public view returns (Record[] memory) {
        require(authorizedProviders[msg.sender] || addressToPatientID[msg.sender] == patientID, "Not authorized to view these records");
        return patientRecords[patientID];
    }

    function getPatientInfo(uint256 patientID) public view returns (Patient memory) {
        require(authorizedProviders[msg.sender] || addressToPatientID[msg.sender] == patientID, "Not authorized to view patient info");
        return patients[patientID];
    }

    function getDoctorInfo(uint256 doctorID) public view returns (Doctor memory) {
        return doctors[doctorID];
    }

    function isAuthorized(address provider) public view returns (bool) {
        return authorizedProviders[provider];
    }

    function getMyPatientID() public view returns (uint256) {
        return addressToPatientID[msg.sender];
    }

    function getMyDoctorID() public view returns (uint256) {
        return providerToDoctorID[msg.sender];
    }
}
