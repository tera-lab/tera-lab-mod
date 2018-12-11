"use strict"

const Default = {
    "id": Math.random().toString(36).slice(-10)
}

module.exports = function Migrator(from, to, settings) {
    if (from === undefined) {
        return Object.assign({}, Default, settings);
    } else if (from === null) {
        return Default;
    } else {
        if(from + 1 < to) {
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }

        switch (to) {
            default:
                settings = Object.assign(Default, settings);
                break;
        }

        return settings;
    }
}
