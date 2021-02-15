/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/




'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
  async Init(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    console.info('=========== Instantiated Bills Chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    console.info('Transaction ID: ' + stub.getTxID());
    console.info(util.format('Args: %j', stub.getArgs()));

    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.log('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

 
  async initBill(stub, args, thisClass) {
   // if (args.length != 4) {
     //throw new Error('Incorrect number of arguments. Expecting 4');
   // }
    // ==== Input sanitation ====
    console.info('--- start init bill ---')
    
    if (args[0].lenth <= 0) {
      throw new Error('1st argument must be a non-empty string');
    }
    if (args[1].lenth <= 0) {
      throw new Error('2nd argument must be a non-empty string');
    }
    if (args[2].lenth <= 0) {
      throw new Error('3rd argument must be a non-empty string');
    }
    if (args[3].lenth <= 0) {
      throw new Error('4th argument must be a non-empty string');
    }
    if (args[4].lenth <= 0) {
      throw new Error('5th argument must be a non-empty string');
    }



    let billName = args[0];
          

    // ==== Check if bill already exists ====
    let billState = await stub.getState(billName);
    if (billState.toString()) {
      throw new Error('This bill already exists: ' + billName);
    }

    // ==== Create bill object and marshal to JSON ====
    let bill = {};
    bill.docType = 'bill';
    bill.name = billName;
    bill.hospital = args[1];
    bill.insurance = args[2];
    bill.agreement = args[3];
    bill.status = args[4];
    bill.status_message = args[5];
    bill.created_at = args[6];
    bill.updated_at = args[7];
    bill.branch = args[8];
    bill.department = args[9];
    bill.patient_name = args[10];
    bill.patient_mobile = args[11];
    bill.patient_age = args[12];
    bill.policy_number = args[13];
    bill.policy_type = args[14];
    bill.discount = args[15];
    bill.approval_number = args[16];
    bill.approval_date = args[17];
    bill.approval_time = args[18];
    bill.insurance_approval = args[19];
    bill.related_bill = args[20];
    bill.doctor_name = args[21];
    bill.service_name = args[22];
    bill.service_description = args[23];
    bill.additional_info = args[24];
    bill.cost = args[25];
    bill.paid_by_patient = args[26];
    bill.vat = args[27];
    bill.remain_to_pay_by_insurance = args[28];
    bill.tx_creator = args[29];
    bill.national_security_number = args[30];
    

            
    // === Save bill to state ===
    await stub.putState(billName, Buffer.from(JSON.stringify(bill)));
    
    // ==== Bill saved and indexed. Return success ====
    console.info('- end init bill');
  }



   // ===========================================================
  // update bill status
  // ===========================================================
  async updateStatus(stub, args, thisClass) {
     
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    let bill_key = args[0];
    let status = args[1];
    let status_message = args[2];
    let updated_at = args[3];
    let tx_creator = args[4];

    console.info('Start process...');

    let billAsBytes = await stub.getState(bill_key);
    if (!billAsBytes || !billAsBytes.toString()) {
      throw new Error('bill does not exist');
    }
    let billToUpdate = {};
    try {
      billToUpdate = JSON.parse(billAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + bill_key;
      throw new Error(jsonResp);
    }
    console.info(billToUpdate);
    billToUpdate.status = status; //change status
    billToUpdate.status_message = status_message; //concern message
    billToUpdate.updated_at = updated_at; //update time
    billToUpdate.tx_creator = tx_creator; //who init transaction
    

    let billJSONasBytes = Buffer.from(JSON.stringify(billToUpdate));
    await stub.putState(bill_key, billJSONasBytes); //rewrite the bill

    console.info('- end updateStatus (success)');
  }


  
  async readBill(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting name of the bill to query');
    }

    let name = args[0];
    if (!name) {
      throw new Error(' bill name must not be empty');
    }
    let billAsbytes = await stub.getState(name); //get the bill from chaincode state
    if (!billAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Bill does not exist: ' + name;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.log(billAsbytes.toString());
    console.info('=======================================');
    return billAsbytes;
  }




  async getAllWithPagination(stub, args, thisClass) {

     
    if (args.length < 3) {
      return shim.Error("Incorrect number of arguments. Expecting 3")
    }

    const queryString = args[0];
    const pageSize = parseInt(args[1], 10);
    const bookmark = args[2];

    const { iterator, metadata } = await stub.getQueryResultWithPagination(queryString, pageSize, bookmark);
    const getAllResults = thisClass['getAllResults'];
    const results = await getAllResults(iterator, false);
    
    results.ResponseMetadata = {
      RecordsCount: metadata.fetched_records_count,
      Bookmark: metadata.bookmark,
    };

    return Buffer.from(JSON.stringify(results));
  }


   
  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }

  async getHistoryForBill(stub, args, thisClass) {

    if (args.length < 1) {
      throw new Error('Incorrect number of arguments. Expecting 1')
    }
    let billName = args[0];
    console.info('- start getHistoryForBill: %s\n', billName);

    let resultsIterator = await stub.getHistoryForKey(billName);
    let method = thisClass['getAllResults'];
    let results = await method(resultsIterator, true);

    return Buffer.from(JSON.stringify(results));
  }


};

shim.start(new Chaincode());