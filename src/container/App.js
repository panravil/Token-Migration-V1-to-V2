import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap';
import getWeb3 from "../utils/getWeb3";
import addresses from "../configs/constant/contracts";
import tokenV1Abi from "../configs/abi/v1.json";
import tokenV2Abi from "../configs/abi/v2.json";
import contractAbi from "../configs/abi/migrateStore.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from '../logo.svg';

const App = () => {
  const [migrationStatus, setMigrationStatus] = useState(false);
  const [migrateContract, setMigrateContract] = useState();
  const [tokenV1Contract, setTokenV1Contract] = useState();
  const [tokenV2Contract, setTokenV2Contract] = useState();
  const [account, setAccount] = useState();
  const [withdrawVal, setWithdrawVal] = useState(0);
  const [migrateV1Val, setMigrateV1Val] = useState(0);
  const [defaultValues, setDefaultValues] = useState({
    v1Address: '',
    v2Address: '',
    rate: 0
  });

  useEffect( async() => {
    const web3 = await getWeb3();
    const tmp_contract = new web3.eth.Contract(contractAbi, addresses.contractMigrateAddress);
    const tmp_tokenV1 = new web3.eth.Contract(tokenV1Abi, addresses.tokenV1Address);
    const tmp_tokenV2 = new web3.eth.Contract(tokenV2Abi, addresses.tokenV2Address);
    const tmp_accounts = await web3.eth.getAccounts();
    const tmp_status  = await tmp_contract.methods.migrationStarted().call();
    setMigrateContract(tmp_contract);
    setTokenV1Contract(tmp_tokenV1);
    setTokenV2Contract(tmp_tokenV2);
    setAccount(tmp_accounts[0]);
    setMigrationStatus(tmp_status);
  }, []);

  const startMigration = () => {
    migrateContract.methods.startMigration().send({from: account}).then((re) => {
      setMigrationStatus(true);
    });
  }

  const stopMigration = () => {
    migrateContract.methods.stopMigration().send({from: account}).then((re) => {
      setMigrationStatus(false);
    });
  }

  const eventHandler = (e) => {
    setDefaultValues((prevState) => {
      return {
        ...prevState,
        [e.target.name]: e.target.value
      }
    })
  }

  const setInitialData = () => {
    migrateContract.methods.setTokenV1andV2(defaultValues['v1Address'], defaultValues['v2Address'], defaultValues['rate']).send({from: account}).then((re) => {
      setMigrationStatus(false);
    });
  }

  const approveV1Handler = () => {
    tokenV1Contract.methods
    .approve(addresses.contractMigrateAddress, "10000000000000000000").send({from: account})
    .then(() => {

    })
  }

  const approveV2Handler = () => {
    tokenV2Contract.methods
    .approve(addresses.contractMigrateAddress, "10000000000000000000").send({from: account})
    .then(() => {

    })
  }

  const withdrawValueHandler = (e) => {
    setWithdrawVal(e.target.value);
  }

  const withdrawTokenHandler = () => {
    migrateContract.methods.withdrawTokens(withdrawVal).send({from: account}).then((re) => {
      console.log('debug', re);
    });
  }
  
  const migrateV1ValueHandler = (e) => {
    setMigrateV1Val(e.target.value);
  }

  const migrateTokenHandler = () => {
    migrateContract.methods.migrateToV2(migrateV1Val).send({from: account}).then((re) => {
      console.log('debug', re);
    });
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col md="6">
          <Row>
            <Col md="4">
              V1 Token Address
            </Col>
            <Col md="8">
              <input type="text" className="form-control" name="v1Address" onChange={(e) => eventHandler(e)} />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md="4">
              V2 Token Address
            </Col>
            <Col md="8">
              <input type="text" className="form-control" name="v2Address" onChange={(e) => eventHandler(e)}/>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md="4">
              Rate
            </Col>
            <Col md="8">
              <input type="number" className="form-control" name="rate" onChange={(e) => eventHandler(e)}/>
            </Col>
          </Row>
          <Row className="justify-content-end mt-3 mb-4">
            <Col md="4">
              <Button className="w-100" onClick={setInitialData}>
                Set Initial Values
              </Button>
            </Col>
          </Row>
          <hr/>
          <Row>
            <Col>
              <Button
                onClick={approveV1Handler}
                className="mb-2 "
              >
                Approve V1
              </Button>
            </Col>
            <Col>
              <Button
                onClick={approveV2Handler}
                className="mb-2 "
              >
                Approve V2
              </Button>
            </Col>
          </Row>
          <hr/>
          <Row>
            <Col md="4">Withdraw Amount</Col>
            <Col md="8">
              <input type="number" className="form-control" onChange={(e) => withdrawValueHandler(e)}/>
            </Col>
          </Row>
          <Row>
            <div className="d-flex justify-content-end mt-2 mt-3">
              <Button
                onClick={withdrawTokenHandler}
                className="mb-2 "
              >
                Withdraw Token
              </Button>
            </div>
          </Row>
          <hr/>
          <Row>
            <Col md="12 mb-4">
              {
                !migrationStatus ? (
                  <Button
                    onClick={startMigration}
                  >
                    Start Migration
                  </Button>
                ) : (
                  <Button 
                    onClick={stopMigration}
                    className=""
                  >
                    Stop Migration
                  </Button>
                )
              }
            </Col>
          </Row>
          <hr/>
          <Row>
            <Col md="4">Migration V1 Amount</Col>
            <Col md="8">
              <input type="number" className="form-control" onChange={(e) => migrateV1ValueHandler(e)}/>
            </Col>
          </Row>
          <Row>
            <div className="d-flex justify-content-end mt-2 mt-3">
              <Button
                onClick={migrateTokenHandler}
                className="mb-2 "
              >
                Migrate To V2
              </Button>
            </div>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
