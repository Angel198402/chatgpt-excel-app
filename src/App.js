/*

  Author: Geghamyan Rustam
  Created on 28 Jan 2023

*/

import React, { Component, useState } from "react";
import XLSX from "xlsx";
import DisplayTable from "./components/DisplayTable.js";
// const openai_api_key = "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";
const DEFAULT_PARAMS = {
  "temperature": 0.6,
  "max_tokens": 300,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
const PROMPT_TITLE="Write a summarization of the following text: You are a professional writer to create a SEO Meta title targeted towards women for a website that has free shipping. OutPut: SEO Meta title. Input: "
const PROMPT_DES="Write a summarization of the following text: You are a professional writer to create a SEO optimized Meta description targeted towards women for a website that has free shipping. Input: "
const PROMPT_PRODUCT="Write a summarization of the following text: You are a professional writer to create a product description targeted towards women for a website that has free shipping. Input: "

const App = () => {
  const [file, setFile] = useState('');
  const [dataArray, setDataArray] = useState([]);
  const [generatingFlag, setGeneratingFlag] = useState(false);
  const [saveFlag, setSaveFlag] = useState(false);
  const [modelName, setModelName] = useState("text-davinci-003");
  const [apikey, setApikey] = useState("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")
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) setFile(files[0]);
    setGeneratingFlag(false);
    setErrorMessage("");
    setSaveFlag(false);
    setDataArray([]);
  }
  const delay = (ms) => new Promise(async (res) => await setTimeout(res, ms)); // delay time

  const sendRequest = async (promptStr, title, desc) => {
    let prompt = promptStr + ".\n Title is " + title + ".\n And product description is " + desc;
    let params;
    if( modelName === "text-davinci-003" ) {
      params = {
        "prompt": prompt
      }
    } else {
      params = {
        "messages": [{"role": "user", "content": prompt}]
      }
    }  
  
    const params_ = { "model": modelName, ...DEFAULT_PARAMS, ...params };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(apikey)
      },
      body: JSON.stringify(params_)
    }
    if( modelName === "text-davinci-003" ) {
      const response = await fetch('https://api.openai.com/v1/completions', requestOptions)
      const data = await response.json()
      if(data.error) {
        setErrorMessage(data.error.message) 
        setGeneratingFlag(false);
        return "";
      } else
      return data.choices[0].text.trim()
    }
    else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions)
      const data = await response.json()
      if(data.error) {
        setErrorMessage(data.error.message) 
        setGeneratingFlag(false);
        return "";
      } else
      return data.choices[0].message.content.trim()
    } 
      
  }

  const handleFile = async () => {
    setGeneratingFlag(true);
    setErrorMessage("");
    setSaveFlag(false);
    if (file.name === undefined) {
      return;
    }

    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = async (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? "binary" : "array",
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const dataArray = XLSX.utils.sheet_to_json(ws, { header: 1 });
      /* Update state */
      console.log("fist = ", dataArray);
      dataArray[0][4] = "Product description";
      dataArray[0][5] = "SEO Meta title"; 
      dataArray[0][6] = "SEO Meta Description"; 
      for(let ind=1; ind< dataArray.length; ind++){
        
        dataArray[ind][4] = await sendRequest(PROMPT_PRODUCT, dataArray[ind][1], dataArray[ind][2]);

        dataArray[ind][5] = await sendRequest(PROMPT_TITLE, dataArray[ind][1], dataArray[ind][2]);

        dataArray[ind][6] = await sendRequest(PROMPT_DES, dataArray[ind][1], dataArray[ind][2]);


      }
      if(errorMessage === "") {
        setDataArray(dataArray);
        console.log("result = ", dataArray);
        setGeneratingFlag(false);
        setSaveFlag(true);
      }
      
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  const saveFile = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My information");
    XLSX.writeFile(workbook, "test.xlsx");
  }

  const handleApikey = (e) => {
    setApikey(e.target.value); 
  }
  const handleModel = (e) => {
    console.log(e.target.value)
    setModelName(e.target.value)
  }
  // handleDataModification(id, valueIndex, newValue) {
  //   const length = this.state.dataArray.length;
  //   var index = -1;
  //   for (var i = 0; i < length; i++) {
  //     if (this.state.dataArray[i][0] === id) {
  //       index = i;
  //       break;
  //     }
  //   }
  //   if (index !== -1) {
  //     let dataArray = [...this.state.dataArray];
  //     let data = [...dataArray[index]];
  //     data[valueIndex] = newValue;
  //     dataArray[index] = data;
  //     this.setState({
  //       dataArray: dataArray,
  //     });
  //   }
  // }

  return (
    <div className="container">
      <div className="buttonDiv">
      {generatingFlag && (<p>Generating .....</p>)}
      {errorMessage !== "" && <p style={{color: "red"}}>{errorMessage}</p>}
      </div>
      <div className="buttonDiv">
        <input
          type="edit"
          className="form-control edit"
          id="text"
          onChange={handleApikey}
          value={apikey}
        />
        <select id="model" className="form-control select" onChange={handleModel}>
          <option value="text-davinci-003">text-davinci-003</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4-0314">gpt-4-0314</option>
        </select>
        <input
          type="file"
          className="form-control Button"
          id="file"
          accept={".xlsx, .csv, .xls"}
          onChange={handleChange}
        />
        <br />
        <input
          type="submit"
          className="Button"
          value="Generate"
          onClick={handleFile}
        />
        {saveFlag && <input
          type="submit"
          className="Button"
          value="Save"
          onClick={saveFile}
        />}
      </div>
      {
        !generatingFlag ? <DisplayTable
          dataObj={dataArray}
        /> : <></>
      }
      
      
      
    </div>
  );
}

export default App;
