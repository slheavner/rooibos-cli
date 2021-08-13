"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
var Tag;
(function (Tag) {
    Tag["TEST_SUITE"] = "'@TestSuite";
    Tag["IT"] = "'@It";
    Tag["IGNORE"] = "'@Ignore";
    Tag["SOLO"] = "'@Only";
    Tag["TEST"] = "'@Test";
    Tag["NODE_TEST"] = "'@SGNode";
    Tag["SETUP"] = "'@Setup";
    Tag["TEAR_DOWN"] = "'@TearDown";
    Tag["BEFORE_EACH"] = "'@BeforeEach";
    Tag["AFTER_EACH"] = "'@AfterEach";
    Tag["TEST_PARAMS"] = "'@Params";
    Tag["TEST_IGNORE_PARAMS"] = "'@IgnoreParams";
    Tag["TEST_SOLO_PARAMS"] = "'@OnlyParams";
})(Tag = exports.Tag || (exports.Tag = {}));
