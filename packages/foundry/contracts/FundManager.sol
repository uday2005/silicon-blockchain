//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract FundManager {
    address public immutable owner;
    struct Organization{
        string name;
        string details;
        uint256 totalFunds;
        address head;
        bool exists;
    }

    mapping(uint256 => Organization) public organizations;
    uint256 public orgCount = 0;

    event OrganizationCreated(uint256 indexed orgId, string name, address indexed head);
    event DonationReceived(uint256 indexed orgId, address indexed donor, uint256 amount);

    constructor(address _owner) {
        owner = _owner;
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
}