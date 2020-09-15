pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract WswapBar is ERC20("WswapBar", "xWSWAP"){
    using SafeMath for uint256;
    IERC20 public wswap;

    constructor(IERC20 _wswap) public {
        wswap = _wswap;
    }

    // Enter the bar. Pay some WSWAPs. Earn some shares.
    function enter(uint256 _amount) public {
        uint256 totalWswap = wswap.balanceOf(address(this));
        uint256 totalShares = totalSupply();
        if (totalShares == 0 || totalWswap == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = _amount.mul(totalShares).div(totalWswap);
            _mint(msg.sender, what);
        }
        wswap.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your WSWAPs.
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 what = _share.mul(wswap.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        wswap.transfer(msg.sender, what);
    }
}