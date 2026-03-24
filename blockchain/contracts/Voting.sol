// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    address public owner;

    struct Candidate {
        uint id;
        string name;
        string description;
        uint voteCount;
        bool exists;
    }

    struct Election {
        uint id;
        string title;
        string description;
        bool active;
        bool exists;
        uint startTime;
        uint endTime;
        uint candidateCount;
    }

    uint public electionCount;

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) public candidates;
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(uint => uint[]) public electionCandidateIds;

    event ElectionCreated(uint indexed electionId, string title);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string name);
    event VoteCast(uint indexed electionId, uint indexed candidateId, address indexed voter);
    event ElectionStarted(uint indexed electionId);
    event ElectionEnded(uint indexed electionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier electionExists(uint _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(
        string memory _title,
        string memory _description
    ) public onlyOwner returns (uint) {
        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            active: false,
            exists: true,
            startTime: 0,
            endTime: 0,
            candidateCount: 0
        });
        emit ElectionCreated(electionCount, _title);
        return electionCount;
    }

    function addCandidate(
        uint _electionId,
        string memory _name,
        string memory _description
    ) public onlyOwner electionExists(_electionId) returns (uint) {
        require(!elections[_electionId].active, "Cannot add candidates to active election");
        elections[_electionId].candidateCount++;
        uint candidateId = elections[_electionId].candidateCount;
        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            description: _description,
            voteCount: 0,
            exists: true
        });
        electionCandidateIds[_electionId].push(candidateId);
        emit CandidateAdded(_electionId, candidateId, _name);
        return candidateId;
    }

    function startElection(uint _electionId) public onlyOwner electionExists(_electionId) {
        require(!elections[_electionId].active, "Election already active");
        require(elections[_electionId].candidateCount > 0, "No candidates added");
        elections[_electionId].active = true;
        elections[_electionId].startTime = block.timestamp;
        emit ElectionStarted(_electionId);
    }

    function endElection(uint _electionId) public onlyOwner electionExists(_electionId) {
        require(elections[_electionId].active, "Election not active");
        elections[_electionId].active = false;
        elections[_electionId].endTime = block.timestamp;
        emit ElectionEnded(_electionId);
    }

    function vote(uint _electionId, uint _candidateId) public electionExists(_electionId) {
        require(elections[_electionId].active, "Election is not active");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");

        hasVoted[_electionId][msg.sender] = true;
        candidates[_electionId][_candidateId].voteCount++;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    function getElection(uint _electionId) public view electionExists(_electionId)
        returns (uint, string memory, string memory, bool, uint, uint, uint) {
        Election memory e = elections[_electionId];
        return (e.id, e.title, e.description, e.active, e.startTime, e.endTime, e.candidateCount);
    }

    function getCandidate(uint _electionId, uint _candidateId) public view
        returns (uint, string memory, string memory, uint) {
        Candidate memory c = candidates[_electionId][_candidateId];
        require(c.exists, "Candidate does not exist");
        return (c.id, c.name, c.description, c.voteCount);
    }

    function getElectionCandidates(uint _electionId) public view electionExists(_electionId)
        returns (uint[] memory) {
        return electionCandidateIds[_electionId];
    }

    function checkVoted(uint _electionId, address _voter) public view returns (bool) {
        return hasVoted[_electionId][_voter];
    }

    function getResults(uint _electionId) public view electionExists(_electionId)
        returns (uint[] memory ids, string[] memory names, uint[] memory voteCounts) {
        uint count = elections[_electionId].candidateCount;
        ids = new uint[](count);
        names = new string[](count);
        voteCounts = new uint[](count);
        for (uint i = 0; i < count; i++) {
            uint cId = electionCandidateIds[_electionId][i];
            Candidate memory c = candidates[_electionId][cId];
            ids[i] = c.id;
            names[i] = c.name;
            voteCounts[i] = c.voteCount;
        }
        return (ids, names, voteCounts);
    }
}
