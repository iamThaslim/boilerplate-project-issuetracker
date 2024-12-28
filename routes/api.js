'use strict';

const { v4: uuidv4 } = require('uuid');

let issues = {}; // This acts as an in-memory database. Replace with a real DB for production.

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get((req, res) => {
      const project = req.params.project;
      const filters = req.query;
      const projectIssues = issues[project] || [];
      const filteredIssues = projectIssues.filter(issue =>
        Object.keys(filters).every(key => issue[key] === filters[key])
      );
      res.json(filteredIssues);
    })

    .post((req, res) => {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const issue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      if (!issues[project]) issues[project] = [];
      issues[project].push(issue);

      res.json(issue);
    })

    .put((req, res) => {
      const project = req.params.project;
      const { _id, ...fieldsToUpdate } = req.body;

      // Check if _id is missing
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Check if no fields to update are provided
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      const projectIssues = issues[project] || [];
      const issue = projectIssues.find(i => i._id === _id);

      // If the issue does not exist, return error
      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      // Update issue fields and timestamp
      Object.assign(issue, fieldsToUpdate);
      issue.updated_on = new Date();

      return res.json({ result: 'successfully updated', '_id': _id });
    })


    .delete((req, res) => {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const projectIssues = issues[project] || [];
      const index = projectIssues.findIndex(i => i._id === _id);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      projectIssues.splice(index, 1);
      res.json({ result: 'successfully deleted', _id });
    });
};
