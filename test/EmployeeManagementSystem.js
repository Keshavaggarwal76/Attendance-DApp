const EmployeeManagementSystem = artifacts.require("EmployeeManagementSystem");
const assert = require("chai").assert;

contract("EmployeeManagementSystem", (accounts) => {
  let employeeManagementSystem;
  const owner = accounts[0];
  const employeeAddress = accounts[1];
  const employeeName = "John Doe";
  const employeeAge = 30;
  const employeeNumber = 1234;
  const dateOfJoining = Math.floor(Date.now() / 1000 / 86400) - 7;

  beforeEach(async () => {
    employeeManagementSystem = await EmployeeManagementSystem.new();
  });

  describe("addEmployee", () => {
    it("should add employee correctly", async () => {
      await employeeManagementSystem.addEmployee(
        employeeAddress,
        employeeName,
        employeeAge,
        employeeNumber,
        dateOfJoining
      );
      const employee = await employeeManagementSystem.employees(
        employeeAddress
      );
      assert.equal(employee.name, employeeName);
      assert.equal(employee.age, employeeAge);
      assert.equal(employee.employeeNumber, employeeNumber);
      assert.equal(employee.dateOfJoining, dateOfJoining);
    });

    it("should fail to add employee with invalid address", async () => {
      try {
        await employeeManagementSystem.addEmployee(
          "0x0000000000000000000000000000000000000000",
          employeeName,
          employeeAge,
          employeeNumber,
          dateOfJoining
        );
        assert.fail("Expected addEmployee to revert");
      } catch (error) {
        assert.include(
          error.message,
          "Invalid employee address",
          "Expected addEmployee to revert with message 'Invalid employee address'"
        );
      }
    });

    it("should fail to add employee that already exists", async () => {
      await employeeManagementSystem.addEmployee(
        employeeAddress,
        employeeName,
        employeeAge,
        employeeNumber,
        dateOfJoining
      );
      try {
        await employeeManagementSystem.addEmployee(
          employeeAddress,
          employeeName,
          employeeAge,
          employeeNumber,
          dateOfJoining
        );
        assert.fail("Expected addEmployee to revert");
      } catch (error) {
        assert.include(
          error.message,
          "Employee already exists",
          "Expected addEmployee to revert with message 'Employee already exists'"
        );
      }
    });
  });

  describe("updateAttendance", () => {
    beforeEach(async () => {
      await employeeManagementSystem.addEmployee(
        employeeAddress,
        employeeName,
        employeeAge,
        employeeNumber,
        dateOfJoining
      );
    });

    it("should update employee attendance correctly", async () => {
      const day = dateOfJoining + 1;
      const status = 1;
      await employeeManagementSystem.updateAttendance(
        employeeAddress,
        day,
        status,
        { from: owner }
      );
      const employee = await employeeManagementSystem.employees(
        employeeAddress
      );
      assert.equal(employee.attendance[day], status);
    });

    it("should fail to update attendance for invalid employee address", async () => {
      const day = dateOfJoining + 1;
      const status = 1;
      try {
        await employeeManagementSystem.updateAttendance(
          "0x0000000000000000000000000000000000000000",
          day,
          status,
          { from: owner }
        );
        assert.fail("Expected updateAttendance to revert");
      } catch (error) {
        assert.include(
          error.message,
          "Invalid employee address",
          "Expected updateAttendance to revert with message 'Invalid employee address'"
        );
      }
    });
  });
});
