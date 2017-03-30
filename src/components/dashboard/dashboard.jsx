const React = require('react');
const FormResponses = require('./formResponses/formResponses.jsx');
const Footer = require('./footer.jsx');

const Dashboard = () => (
  <div>
    <FormResponses />
    <Footer />
  </div>
);

module.exports = Dashboard;
