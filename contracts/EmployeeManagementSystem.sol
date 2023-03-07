// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeManagementSystem {
    address public owner;

    enum Attendance {
        NA,
        Present,
        Absent,
        Leave
    }
    Attendance constant default_value = Attendance.NA;

    uint256 public t = block.timestamp;
    struct Employee {
        string name;
        uint256 age;
        uint256 employeeNumber;
        uint256 dateOfJoining;
        mapping(uint256 => Attendance) attendance;
    }

    mapping(address => Employee) public employees;
    mapping(uint256 => mapping(Attendance => uint256)) public dailyAttendance;

    event EmployeeAdded(
        address indexed employeeAddress,
        string name,
        uint256 age,
        uint256 employeeNumber,
        uint256 dateOfJoining
    );
    event EmployeeAttendanceUpdated(
        address indexed employeeAddress,
        uint256 date,
        Attendance status
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addEmployee(
        address _employeeAddress,
        string memory _name,
        uint256 _age,
        uint256 _employeeNumber,
        uint256 _dateOfJoining
    ) public onlyOwner {
        require(_employeeAddress != address(0), "Invalid employee address");
        require(
            employees[_employeeAddress].employeeNumber == 0,
            "Employee already exists"
        );

        Employee storage _employee = employees[_employeeAddress];
        _employee.name = _name;
        _employee.age = _age;
        _employee.employeeNumber = _employeeNumber;
        _employee.dateOfJoining = _dateOfJoining / (1 days * 1000);
        _employee.attendance[_dateOfJoining] = default_value;

        emit EmployeeAdded(
            _employeeAddress,
            _name,
            _age,
            _employeeNumber,
            _dateOfJoining
        );
    }

    function updateAttendance(
        address _employeeAddress,
        uint256 _day,
        Attendance _status
    ) public {
        uint256 day = _day / (1 days * 1000);

        require(_employeeAddress != address(0), "Invalid employee address");
        require(
            employees[_employeeAddress].employeeNumber != 0,
            "Employee does not exist"
        );
        require(
            employees[_employeeAddress].attendance[day] == Attendance(0),
            "Already Marked"
        );

        require(day <= (block.timestamp / 1 days), "Invalid day");

        employees[_employeeAddress].attendance[day] = _status;
        dailyAttendance[day][_status]++;

        emit EmployeeAttendanceUpdated(_employeeAddress, day, _status);
    }

    function getEmployee(
        address _employeeAddress
    )
        public
        view
        returns (string memory, uint256, uint256, uint256, Attendance[] memory)
    {
        require(_employeeAddress != address(0), "Invalid employee address");
        require(
            employees[_employeeAddress].employeeNumber != 0,
            "Employee does not exist"
        );

        Employee storage employee = employees[_employeeAddress];
        Attendance[] memory attendance = new Attendance[](
            (block.timestamp / 1 days) - employee.dateOfJoining + 1
        );

        for (
            uint256 i = employee.dateOfJoining;
            i <= (block.timestamp / 1 days);
            i++
        ) {
            attendance[i - employee.dateOfJoining] = employee.attendance[i];
        }

        return (
            employee.name,
            employee.age,
            employee.employeeNumber,
            employee.dateOfJoining,
            attendance
        );
    }

    function getDailyAttendance(
        uint256 _day,
        Attendance _status
    ) public view returns (uint256) {
        require(
            (_day / (1 days * 1000)) <= (block.timestamp / 1 days),
            "Invalid day"
        );
        return dailyAttendance[_day / (1 days * 1000)][_status];
    }

    function getAttendanceByDateRange(
        address _employeeAddress,
        uint256 _startDate,
        uint256 _endDate
    ) public view returns (Attendance[] memory) {
        require(_employeeAddress != address(0), "Invalid employee address");
        require(
            employees[_employeeAddress].employeeNumber != 0,
            "Employee does not exist"
        );
        require(_startDate <= _endDate, "Start date should be before end date");

        uint256 startDate = _startDate / (1 days * 1000);
        uint256 endDate = _endDate / (1 days * 1000);

        require(
            startDate >= employees[_employeeAddress].dateOfJoining,
            "Invalid start date"
        );
        require(endDate <= (block.timestamp / 1 days), "Invalid end date");

        uint256 numDays = endDate - startDate + 1;
        Attendance[] memory attendance = new Attendance[](numDays);

        for (uint256 i = startDate; i <= endDate; i++) {
            attendance[i - startDate] = employees[_employeeAddress].attendance[
                i
            ];
        }

        return attendance;
    }
}
