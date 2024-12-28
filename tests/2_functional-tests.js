const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let testId;

    suite('POST /api/issues/{project}', function () {
        test('Create an issue with every field', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'Text',
                    created_by: 'Tester',
                    assigned_to: 'Someone',
                    status_text: 'Open'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    testId = res.body._id; // Store for later use.
                    done();
                });
        });

        test('Create an issue with only required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'Text',
                    created_by: 'Tester'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'assigned_to', '');
                    done();
                });
        });

        test('Create an issue with missing required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'error', 'required field(s) missing');
                    done();
                });
        });
    });

    suite('GET /api/issues/{project}', function () {
        test('View issues on a project', function (done) {
            chai.request(server)
                .get('/api/issues/test')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues on a project with one filter', function (done) {
            chai.request(server)
                .get('/api/issues/test?open=true')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues on a project with multiple filters', function (done) {
            chai.request(server)
                .get('/api/issues/test?open=true&assigned_to=Someone')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });
    });

    suite('PUT /api/issues/{project}', function () {
        test('Update one field on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: testId, issue_title: 'New Title' })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'result', 'successfully updated');
                    done();
                });
        });

        test('Update an issue with an invalid _id', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: 'invalid_id', issue_title: 'New Title' })
                .end((err, res) => {
                    assert.propertyVal(res.body, 'error', 'could not update');
                    assert.propertyVal(res.body, '_id', 'invalid_id');
                    done();
                });
        });

        test('Update an issue with no fields to update', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: testId })
                .end((err, res) => {
                    assert.propertyVal(res.body, 'error', 'no update field(s) sent');
                    assert.propertyVal(res.body, '_id', testId);
                    done();
                });
        });

        test('Update multiple fields on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: testId,
                    issue_title: 'Updated Title',
                    issue_text: 'Updated Text'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'result', 'successfully updated');
                    assert.propertyVal(res.body, '_id', testId);
                    done();
                });
        });


        test('Update an issue with missing _id', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({})
                .end((err, res) => {
                    assert.propertyVal(res.body, 'error', 'missing _id');
                    done();
                });
        });
    });


    suite('DELETE /api/issues/{project}', function () {
        test('Delete an issue', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: testId })
                .end((err, res) => {
                    assert.propertyVal(res.body, 'result', 'successfully deleted');
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: 'invalid_id' })
                .end((err, res) => {
                    assert.propertyVal(res.body, 'error', 'could not delete');
                    assert.propertyVal(res.body, '_id', 'invalid_id');
                    done();
                });
        });


        test('Delete an issue with missing _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end((err, res) => {
                    assert.propertyVal(res.body, 'error', 'missing _id');
                    done();
                });
        });
    });
});
