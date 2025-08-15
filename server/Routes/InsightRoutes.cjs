const router = require('express').Router();
const { fetchDependencyHealth } = require('../Controllers/InsightController');

router.get('/:username/:reponame/insights/dependencies', fetchDependencyHealth);

module.exports = router;
