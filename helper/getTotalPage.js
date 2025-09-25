const { queryRunner } = require("../helper/queryRunner");

const getTotalPage = async (countQuery, limit, params=[]) => {
  let totalResult;
  if(params.length>0){
    totalResult = await queryRunner(countQuery, params);
  }else{
    totalResult = await queryRunner(countQuery);
  }
  if (totalResult[0] && totalResult[0].length > 0) {
    const totalGigs = totalResult[0][0].total;
    return Math.ceil(totalGigs / limit);
  }
  return 0;
};

module.exports = { getTotalPage };
