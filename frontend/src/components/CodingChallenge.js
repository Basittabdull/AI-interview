import React from 'react';

const CodingChallenge = ({ show }) => {
  return (
    <div id="coding-challenge" className={!show ? 'hidden' : ''}>
      <h3>Coding Challenge</h3>
      <textarea placeholder="Write your code here..."></textarea>
    </div>
  );
};

export default CodingChallenge;