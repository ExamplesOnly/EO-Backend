exports.EoMobileuserAgent = (req, res, next) => {
  const eoAgent = req.header("EO-Agent");
  if (eoAgent) {
    try {
      let agentDetails = eoAgent.split(";");
      console.log(agentDetails);
      req.eoAgent = null;
    } catch (e) {
      req.eoAgent = null;
    }
    next();
  } else {
    next();
  }
};
