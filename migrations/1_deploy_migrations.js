const EmployeeManagementSystem = artifacts.require("EmployeeManagementSystem");

module.exports = function (deployer) {
  deployer.deploy(EmployeeManagementSystem);
};
