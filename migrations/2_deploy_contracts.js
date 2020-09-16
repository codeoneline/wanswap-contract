const config = require("../truffle-config");
const WswapToken = artifacts.require('WswapToken');
const WwanToken = artifacts.require('WwanToken');
const MasterChef = artifacts.require('MasterChef');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
// const UniswapV2Router01 = artifacts.require('UniswapV2Router01');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');
const Timelock = artifacts.require('Timelock');
const Migrator = artifacts.require('Migrator');
const WswapMaker = artifacts.require('WswapMaker');
const WswapBar = artifacts.require('WswapBar');

module.exports = async (deployer, network, accounts) => {
  console.log(`network = ${network}`)
  // set accounts
  const [owner, admin, other] = accounts;
  const networkConfig = config.networks[network]
  const from = networkConfig.from ? networkConfig.from : owner;
  console.log(`from = ${from}`)

  // mock wwan token ---- should use dex wwan
  await deployer.deploy(WwanToken);
  const wwan = await WwanToken.deployed();
  console.log(`wwan should use dex_wwan: ${wwan.address}`);

  // deploy wswap token  block:10736094
  await deployer.deploy(WswapToken);
  const wswapToken = await WswapToken.deployed();
  console.log(`wswap token: ${wswapToken.address}`);

  // deploy MasterChef block: 10736242
  // 100 WSWAP
  const wswapPerBlock = "100000000000000000000";
  const bonusEndBlock = 52536020;
  const startBlock = 5453602;
  const devAddr = from;
  await deployer.deploy(
    MasterChef,
    wswapToken.address,
    devAddr,
    wswapPerBlock,
    startBlock,
    bonusEndBlock
  );
  const masterChef = await MasterChef.deployed()
  console.log(`master chef: ${masterChef.address}`)

  // Time lock block: 10736410
  await deployer.deploy(Timelock, from, 0x2a300)
  const timeLock = await Timelock.deployed()
  console.log(`Timelock: ${timeLock.address}`)

  // deploy factory block: 10794229
  const feeAccount = networkConfig.feeToSetter ? networkConfig.feeToSetter : other;
  console.log(`feeAccount = ${feeAccount}`)
  await deployer.deploy(UniswapV2Factory, feeAccount);
  const uniswapV2Factory = await UniswapV2Factory.deployed();
  console.log(`UniswapV2Factory = ${uniswapV2Factory.address}`)

  const WWan = wwan.address;
  const Factory = uniswapV2Factory.address;

  // // deploy router01 not deployed in
  // await deployer.deploy(UniswapV2Router01, Factory, WWan);
  // const uniswapV2Routor01 = await UniswapV2Router01.deployed();
  // console.log(`UniswapV2Router01 = ${uniswapV2Routor01.address}`)

  // deploy router02 block: 10794261
  await deployer.deploy(UniswapV2Router02, Factory, WWan);
  const uniswapV2Routor02 = await UniswapV2Router02.deployed();
  console.log(`UniswapV2Router02 = ${uniswapV2Routor02.address}`)

  // // deploy migrator block: 10794305
  // const _notBeforeBlock = 0
  // const _oldFactory = 0
  // await deployer.deploy(Migrator, masterChef.address, _oldFactory, Factory, _notBeforeBlock)
  // const migrator = await Migrator.deployed();
  // console.log(`Migrator = ${migrator.address}`)

  // deploy wswapBar block: 10801571
  await deployer.deploy(WswapBar, wswapToken.address)
  const wswapBar = await WswapBar.deployed()
  console.log(`WswapBar = ${wswapBar.address}`)

  // deploy WswapMaker block: 10801592
  await deployer.deploy(WswapMaker, Factory, wswapToken.address, wswapBar.address, WWan)
  const wswapMaker = await wswapMaker.deployed()
  console.log(`WswapMaker = ${wswapMaker.address}`)
};
