const circleModel  = require('../models/circle-model'); 
const parentModel = require('../models/parent-model'); 

async function createOrFindCircle(circleName, parentId) {
    try {
        let circle = await circleModel.findOne({ name: circleName });

        if (!circle) {
            circle = await circleModel.create({
                name: circleName,
                parents: [parentId],
                member_count: 1,
            });
        } else {
            if (!circle.parents.includes(parentId)) {
                circle.parents.push(parentId);
                circle.member_count += 1;
                await circle.save();
            }
        }

        const parent = await parentModel.findOne({_id:parentId});
        if (parent && !parent.circles.includes(circle._id)) {
            parent.circles.push(circle._id);
            await parent.save();
        }

    } catch (error) {
        console.error("Error in creating or finding circle:", error);
        throw error;
    }
}

module.exports = createOrFindCircle ;
