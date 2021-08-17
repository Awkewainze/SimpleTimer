import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "../src/timer";

describe("timer", () => {
    describe("for", () => {
        it("should return the sum of the given numbers", () => {
            Timer.for(Duration.fromSeconds(10));
        });
    });
});