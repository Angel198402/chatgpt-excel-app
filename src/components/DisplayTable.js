import React, { Component } from "react";
import PropTypes from "prop-types";
import "../App.css";

const DisplayTable = (dataObj) => {
  const data = Object.values(dataObj);
  const dataArray = data[0];
  console.log(dataArray)

  const renderHeader = () => {
    var arr = dataArray[0];
    return (
      <tr>
        {arr.map((val) => {
          return <th key={val}>{val}</th>;
        })}
      </tr>
    );
  };

  const delay = (ms) => new Promise(async (res) => await setTimeout(res, ms)); // delay time

  return (
    <div>
      {/* 1st row is headers and 2nd row contains data */}
      {dataArray.length >= 2 && (
        <table className="customers">
          <thead>{renderHeader()}</thead>
          <tbody>
            {dataArray.map((obj, index) => {
              // ignore the headers here
              if (index === 0) {
                return null;
              }
              return (
                <tr key={index}>
                  <td key={obj[0] + index}> {obj[0]} </td>
                  <td key={obj[1] + index}> {obj[1]} </td>
                  <td key={obj[2] + index}> {obj[2]} </td>
                  <td key={obj[3] + index}> {obj[3]} </td>
                  <td key={obj[4] + index}> {obj[4]} </td>
                  <td key={obj[5] + index}> {obj[5]} </td>
                  <td key={obj[6] + index}> {obj[6]} </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  );

}

DisplayTable.propTypes = {
  dataObj: PropTypes.array.isRequired,
};


export default DisplayTable;
