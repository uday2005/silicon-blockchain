//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author Silicon
 */
contract FundManager {
    enum ExpenseStatus { Pending, Approved }
    address public immutable owner;

    struct Expense {
        string description;
        address vendor;
        uint256 amount;
        string proofHash;
        ExpenseStatus status;
    }
    struct Organization{
        string name;
        string details;
        uint256 totalFunds;
        address head;
        bool exists;
    }

        struct Vendor {
        string name;
        string details;
        address wallet;
        uint256 reputation; // trust score
        bool exists;
    }

    mapping(address => Vendor) public vendors;
   
    mapping(uint256 => Organization) public organizations;
    // orgId => expenses[]
    mapping(uint256 => Expense[]) public expenses;
    uint256 public orgCount = 0;

    event OrganizationCreated(uint256 indexed orgId, string name, address indexed head);
    event DonationReceived(uint256 indexed orgId, address indexed donor, uint256 amount);
    event ExpenseCreated(uint256 indexed orgId, uint256 indexed expenseId, string description, address vendor, uint256 amount, string proofHash);
    event ExpenseApproved(uint256 indexed orgId, uint256 indexed expenseId);
    event VendorRegistered(address indexed vendor, string name, string details);

    constructor() {
        owner = msg.sender;
    }

    /**
     * Function to create an organization on-chain
     * Only the organization head can call this
     */
    function createOrganization(string memory _name, string memory _details) public {
        orgCount += 1;
        organizations[orgCount] = Organization({
            name: _name,
            details: _details,
            head: msg.sender,
            totalFunds: 0,
            exists: true
        });
        emit OrganizationCreated(orgCount, _name, msg.sender);
    }

    /**
     * Function for donors to donate ETH to an organization
     */
    function donate(uint256 _orgId) public payable {
        require(organizations[_orgId].exists, "Organization does not exist");
        require(msg.value > 0, "Donation must be greater than 0");
        organizations[_orgId].totalFunds += msg.value;

        emit DonationReceived(_orgId, msg.sender, msg.value);
    }

    /**
     * Called by organization head to record a spending entry.
     */
    function createExpense(
        uint256 _orgId,
        string memory _description,
        address _vendor,
        uint256 _amount,
        string memory _proofHash
    ) public {
        Organization storage org = organizations[_orgId];
        require(org.exists, "Organization does not exist");
        require(msg.sender == org.head, "Only org head can create expense");
        require(_amount <= org.totalFunds, "Insufficient funds");

        expenses[_orgId].push(Expense({
            description: _description,
            vendor: _vendor,
            amount: _amount,
            proofHash: _proofHash,
            status: ExpenseStatus.Pending
        }));

        emit ExpenseCreated(_orgId, expenses[_orgId].length - 1, _description, _vendor, _amount, _proofHash);
    }

    /**
     * Called by auditor or admin to approve an expense.
     * Optionally releases payment to vendor.
     */
    function approveExpense(uint256 _orgId, uint256 _expenseId) public {
        // For demo, only contract owner is auditor/admin
        require(msg.sender == owner, "Only admin can approve");
        Organization storage org = organizations[_orgId];
        require(org.exists, "Organization does not exist");
        Expense storage exp = expenses[_orgId][_expenseId];
        require(exp.status == ExpenseStatus.Pending, "Already approved");
        require(exp.amount <= org.totalFunds, "Insufficient funds");

        exp.status = ExpenseStatus.Approved;
        org.totalFunds -= exp.amount;
        payable(exp.vendor).transfer(exp.amount);

        emit ExpenseApproved(_orgId, _expenseId);
    }

    /**
     * View all expenses for an organization.
     */
    function getExpenses(uint256 _orgId) public view returns (Expense[] memory) {
        return expenses[_orgId];
    }

    function registerVendor(string memory _name, string memory _details) public {
        require(!vendors[msg.sender].exists, "Already registered");
        vendors[msg.sender] = Vendor({
            name: _name,
            details: _details,
            wallet: msg.sender,
            reputation: 0,
            exists: true
        });
        emit VendorRegistered(msg.sender, _name, _details);
    }

    // Proof management
    mapping(uint256 => mapping(uint256 => string)) public expenseProofs; // orgId => expenseId => proofHash
    mapping(uint256 => mapping(uint256 => int256)) public proofTrustScores; // orgId => expenseId => score
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) public hasVoted; // hasVoted[user][orgId][expenseId]
    event ProofSubmitted(uint256 indexed orgId, uint256 indexed expenseId, string proofHash, address indexed submitter);
    event ProofVerified(uint256 indexed orgId, uint256 indexed expenseId, int256 newScore, address indexed verifier, bool upvote);

    function submitProof(uint256 _orgId, uint256 _expenseId, string memory _proofHash) public {
        Expense storage exp = expenses[_orgId][_expenseId];
        require(msg.sender == exp.vendor || msg.sender == organizations[_orgId].head, "Not authorized");
        expenseProofs[_orgId][_expenseId] = _proofHash;
        emit ProofSubmitted(_orgId, _expenseId, _proofHash, msg.sender);
    }

   function verifyProof(uint256 _orgId, uint256 _expenseId, bool upvote) public {
    require(bytes(expenseProofs[_orgId][_expenseId]).length > 0, "No proof submitted");
    require(!hasVoted[msg.sender][_orgId][_expenseId], "Already voted for this proof");
    hasVoted[msg.sender][_orgId][_expenseId] = true;

    if (upvote) {
        proofTrustScores[_orgId][_expenseId] += 1;
        vendors[expenses[_orgId][_expenseId].vendor].reputation += 1;
    } else {
        proofTrustScores[_orgId][_expenseId] -= 1;
        vendors[expenses[_orgId][_expenseId].vendor].reputation -= 1;
    }
    emit ProofVerified(_orgId, _expenseId, proofTrustScores[_orgId][_expenseId], msg.sender, upvote);
}

}
