import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import Button from "./components/Button";
import Input from "./components/Input";
import getWeb3 from "./getWeb3";
import EmployeeManagementSystem from "./contracts/EmployeeManagementSystem.json";

function App() {
  const Attendance = {
    1: "Present",
    2: "Absent",
    3: "Leave",
  };

  const [inputs, setInputs] = useState({
    address: "",
    name: "",
    age: "",
    number: "",
    getEmployee: "",
    getMonthlyAttendance: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const EmployeeManagementSystemContractRef = useRef(null);
  const web3 = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [attendanceStatusCount, setAttendanceStatusCount] = useState({
    Present: 0,
    Absent: 0,
    Leave: 0,
  });
  const [attendanceStatusCountRange, setAttendanceStatusCountRange] = useState({
    Present: 0,
    Absent: 0,
    Leave: 0,
  });
  const [showAttendance, setShowAttendance] = useState({
    Present: false,
    Absent: false,
    Leave: false,
  });
  const [showAttendanceRange, setShowAttendanceRange] = useState({
    Present: false,
    Absent: false,
    Leave: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const web = await getWeb3();
        web3.current = web;
        const accounts = await web.eth.getAccounts();
        setCurrentAccount(await web.eth.currentProvider.selectedAddress);
        setAccounts(accounts);
        const networkId = await web.eth.net.getId();
        const EmployeeManagementSystemContract = new web.eth.Contract(
          EmployeeManagementSystem.abi,
          EmployeeManagementSystem.networks[networkId] &&
            EmployeeManagementSystem.networks[networkId].address
        );
        EmployeeManagementSystemContractRef.current =
          EmployeeManagementSystemContract;
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const addEmployee = async () => {
    await EmployeeManagementSystemContractRef.current.methods
      .addEmployee(
        inputs.address,
        inputs.name,
        Number(inputs.age),
        Number(inputs.number),
        Date.now()
      )
      .send({ from: accounts[0] })
      .on("receipt", function (receipt) {
        alert(
          receipt.events.EmployeeAdded.returnValues[1] + " added successfully"
        );
      })
      .on("error", function (error) {
        alert(error.message);
      })
      .on("myEvent", function (event) {
        alert("My event: ", event);
      });
    setInputs({
      address: "",
      name: "",
      age: "",
      number: "",
    });
  };

  const updateAttendance = async (status) => {
    await EmployeeManagementSystemContractRef.current.methods
      .updateAttendance(currentAccount, Date.now(), Number(status))
      .send({ from: currentAccount })
      .on("receipt", function (receipt) {
        alert(
          "Marked " +
            Attendance[receipt.events.EmployeeAttendanceUpdated.returnValues[2]]
        );
      })
      .on("error", function (error) {
        alert(error.message);
      })
      .on("myEvent", function (event) {
        alert("My event: ", event);
      });
  };

  const getEmployee = async () => {
    await EmployeeManagementSystemContractRef.current.methods
      .getEmployee(inputs.getEmployee)
      .call({ from: currentAccount }, (err, data) => setEmployeeData(data));
  };

  const getDailyAttendance = async (e, status) => {
    await EmployeeManagementSystemContractRef.current.methods
      .getDailyAttendance(Date.now(), status)
      .call({ from: currentAccount }, (err, data) => {
        setAttendanceStatusCount({
          ...attendanceStatusCount,
          [e.target.name]: data,
        });
        setShowAttendance({
          Present: status === 1,
          Absent: status === 2,
          Leave: status === 3,
        });
        setTimeout(() => {
          setShowAttendance({
            Present: false,
            Absent: false,
            Leave: false,
          });
        }, 3000);
      });
  };

  const getAttendanceByDateRange = async (e, status) => {
    await EmployeeManagementSystemContractRef.current.methods
      .getAttendanceByDateRange(
        inputs.getMonthlyAttendance,
        new Date(inputs.startDate).getTime(),
        new Date(inputs.endDate).getTime()
      )
      .call({ from: currentAccount }, (err, data) => {
        if (err) {
          alert(err.message);
        }
        const count = data.reduce((acc, val) => {
          return acc + (val === String(status) ? 1 : 0);
        }, 0);
        setAttendanceStatusCountRange({
          ...attendanceStatusCountRange,
          [e.target.name]: count,
        });
        setShowAttendanceRange({
          Present: status === 1,
          Absent: status === 2,
          Leave: status === 3,
        });
        setTimeout(() => {
          setShowAttendanceRange({
            Present: false,
            Absent: false,
            Leave: false,
          });
        }, 3000);
      });
  };

  return (
    <>
      <div className="container m-3">
        <h1>Employee Attendance Management System</h1>

        <div className="btn">
          <Button
            type="button"
            primary
            dataBsToggle="modal"
            dataBsTarget="#staticBackdrop"
          >
            Add Employee
          </Button>

          <div
            className="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="staticBackdropLabel">
                    Add Employee
                  </h5>
                  <Button
                    type="button"
                    cls="btn-close"
                    dataBsDismiss="modal"
                    ariaLabel="Close"
                  ></Button>
                </div>
                <div className="modal-body">
                  <label className="label">Employee Address</label>
                  <Input
                    inputs={inputs}
                    onChange={onChange}
                    name="address"
                    placeholder="0x32F44FE78943a60250Bc7E4BBf7695A1c5a72E8B"
                  ></Input>
                  <label className="label">Name</label>
                  <Input
                    inputs={inputs}
                    onChange={onChange}
                    name="name"
                    placeholder="Rohan Verma"
                  ></Input>
                  <label className="label">Age</label>
                  <Input
                    inputs={inputs}
                    onChange={onChange}
                    name="age"
                    placeholder="22"
                  ></Input>
                  <label className="label">Employee Number</label>
                  <Input
                    inputs={inputs}
                    onChange={onChange}
                    name="number"
                    placeholder="1432"
                  ></Input>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    dark
                    dataBsDismiss="modal"
                    onClick={addEmployee}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="btn">
          <Input
            inputs={inputs}
            onChange={onChange}
            name="getEmployee"
            placeholder="0x32F44FE78943a60250Bc7E4BBf7695A1c5a72E8B"
          ></Input>
          <Button
            dark
            onClick={getEmployee}
            dataBsToggle="modal"
            dataBsTarget="#staticBackdrop1"
          >
            Employee Details
          </Button>
          <div
            className="modal fade"
            id="staticBackdrop1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="staticBackdropLabel1">
                    Employee Details
                  </h5>
                  <Button
                    type="button"
                    cls="btn-close"
                    dataBsDismiss="modal"
                    ariaLabel="Close"
                  ></Button>
                </div>
                <div className="modal-body">
                  <label className="label">
                    Employee Name : {employeeData[0]}
                  </label>
                  <label className="label">
                    Employee Age : {employeeData[1]}
                  </label>
                  <label className="label">
                    Employee Number : {employeeData[2]}
                  </label>
                  <label className="label">
                    Joining Date :{" "}
                    {new Date(Number(employeeData[3]) * 86400000)
                      .toString()
                      .substr(4, 11)}
                  </label>
                  <label className="label">
                    Today's Attendance : {Attendance[employeeData[4]]}
                  </label>
                </div>
                <div className="modal-footer">
                  <Button type="button" dark dataBsDismiss="modal">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="btn">
          <Button success outline onClick={() => updateAttendance(1)}>
            Present
          </Button>
          <Button danger outline onClick={() => updateAttendance(2)}>
            Absent
          </Button>
          <Button warning outline onClick={() => updateAttendance(3)}>
            On Leave
          </Button>
        </div>

        <div className="btn">
          <Button
            success
            name="Present"
            onClick={(e) => getDailyAttendance(e, 1)}
          >
            Today Present Count
          </Button>
          <Button
            danger
            name="Absent"
            onClick={(e) => getDailyAttendance(e, 2)}
          >
            Today Absent Count
          </Button>
          <Button
            warning
            name="Leave"
            onClick={(e) => getDailyAttendance(e, 3)}
          >
            Today Leave Count
          </Button>
        </div>
        <div className="btn">
          {showAttendance.Present && (
            <Button success outline disabled name="Present">
              {attendanceStatusCount.Present}
            </Button>
          )}
          {showAttendance.Absent && (
            <Button danger outline disabled name="Absent">
              {attendanceStatusCount.Absent}
            </Button>
          )}
          {showAttendance.Leave && (
            <Button warning outline disabled name="Leave">
              {attendanceStatusCount.Leave}
            </Button>
          )}
        </div>
        <div className="btn">
          <div className="me-4">
            <Input
              inputs={inputs}
              onChange={onChange}
              name="getMonthlyAttendance"
              placeholder="0x32F44FE78943a60250Bc7E4BBf7695A1c5a72E8B"
            ></Input>
          </div>
          <div className="me-4">
            <Input
              inputs={inputs}
              type="date"
              onChange={onChange}
              name="startDate"
            ></Input>
          </div>
          <div className="me-4">
            <Input
              inputs={inputs}
              type="date"
              onChange={onChange}
              name="endDate"
            ></Input>
          </div>
        </div>
        <div className="btn">
          <Button
            success
            name="Present"
            onClick={(e) => getAttendanceByDateRange(e, 1)}
          >
            Present Count
          </Button>
          <Button
            danger
            name="Absent"
            onClick={(e) => getAttendanceByDateRange(e, 2)}
          >
            Absent Count
          </Button>
          <Button
            warning
            name="Leave"
            onClick={(e) => getAttendanceByDateRange(e, 3)}
          >
            Leave Count
          </Button>
        </div>
        <div className="btn">
          {showAttendanceRange.Present && (
            <Button success outline disabled name="Present">
              {attendanceStatusCountRange.Present}
            </Button>
          )}
          {showAttendanceRange.Absent && (
            <Button danger outline disabled name="Absent">
              {attendanceStatusCountRange.Absent}
            </Button>
          )}
          {showAttendanceRange.Leave && (
            <Button warning outline disabled name="Leave">
              {attendanceStatusCountRange.Leave}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
