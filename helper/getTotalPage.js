const { queryRunner } = require("../helper/queryRunner");

const getTotalPage = async (countQuery, limit) => {
  const totalResult = await queryRunner(countQuery);

  if (totalResult[0] && totalResult[0].length > 0) {
    const totalGigs = totalResult[0][0].total;
    return Math.ceil(totalGigs / limit);
  }
  return 0;
};

module.exports = { getTotalPage };
