'use strict';
let options = {};

const { Review } = require('../models');
const { Op } = require('sequelize'); 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Review.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        review: 'Very nice beach',
        stars: 5
      },
      {
        spotId: 1,
        userId: 2,
        review: 'I like it',
        stars: 3
      },
      {
        spotId: 2,
        userId: 3,
        review: 'Amazing stay!',
        stars: 5
      }
    ],{ validate: true })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Reviews', {
      id: { [Op.in]: [1, 2, 3] }
    }, {})
  }
};
