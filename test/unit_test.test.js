const myController = require('../src/controllers/myController');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const assert = chai.assert;
let server = require('../src/server');

chai.use(deepEqualInAnyOrder);

describe('Test unit test', () => {
    // it('it should GET all the pets', (done) => {
    //     let area = {
    //         "user": {
    //             "email": "jake@jake.jake",
    //             "password": "jakejake"
    //         }
    //     }

    //     chai.request(server)
    //         .post('/api/users/login')
    //         .send(area)
    //         .end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('array');
    //             res.body.length.should.be.eql(9); // fixme :)
    //             done();
    //         });
    // });

    it('Test get user', async () => {
        const result = {
            "user": {
                "email": "jake@jake.jake",
                "username": "jake",
                "bio": null,
                "image": null
            }
        }
    
        let area = {
            "user": {
                "email": "jake@jake.jake",
                "password": "jakejake"
            }
        }

        let data = await myController.getUser(area);
        expect(data).to.deep.equalInAnyOrder(result);
    });
})