const AccessControl = require("accesscontrol");

let grantsObject = {
    admin: {
        user: {
            "create:any": ["*"],
            "update:any": ["*"],
            "delete:any": ["*"]
        }
    },
    basic: {
        user: {
            "update:own": ["*"],
        }
    }
};

const accessCtrl = new AccessControl();

exports.roles = (() => {
    accessCtrl.setGrants(grantsObject);
    return accessCtrl;
})();
