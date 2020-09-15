const { expectRevert } = require('@openzeppelin/test-helpers');
const WswapToken = artifacts.require('WswapToken');

contract('WswapToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.wswap = await WswapToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.wswap.name();
        const symbol = await this.wswap.symbol();
        const decimals = await this.wswap.decimals();
        assert.equal(name.valueOf(), 'WswapToken');
        assert.equal(symbol.valueOf(), 'WSWAP');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.wswap.mint(alice, '100', { from: alice });
        await this.wswap.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.wswap.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.wswap.totalSupply();
        const aliceBal = await this.wswap.balanceOf(alice);
        const bobBal = await this.wswap.balanceOf(bob);
        const carolBal = await this.wswap.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.wswap.mint(alice, '100', { from: alice });
        await this.wswap.mint(bob, '1000', { from: alice });
        await this.wswap.transfer(carol, '10', { from: alice });
        await this.wswap.transfer(carol, '100', { from: bob });
        const totalSupply = await this.wswap.totalSupply();
        const aliceBal = await this.wswap.balanceOf(alice);
        const bobBal = await this.wswap.balanceOf(bob);
        const carolBal = await this.wswap.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.wswap.mint(alice, '100', { from: alice });
        await expectRevert(
            this.wswap.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.wswap.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
