exports.EoMobileuserAgent = (req, res, next) => {
  const eoAgent = req.header("EO-Agent");
  if (eoAgent) req.eoAgent = eoAgent;

  next();
};
