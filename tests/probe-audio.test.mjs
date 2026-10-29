import test from "node:test";
import assert from "node:assert/strict";
import {rms,dbfs,summarizeAudioWindow} from "../src/probe/audio.mjs";

test("zero and nonzero audio amplitude are measured without raw media storage",()=>{
  assert.equal(rms(new Float32Array([0,0,0,0])),0);
  assert.equal(dbfs(0),-Infinity);
  assert.equal(dbfs(1),0);
  assert.ok(Math.abs(rms([.5,-.5,.5,-.5])-.5)<1e-8);
  assert.equal(rms([]),null);
  assert.equal(dbfs(-1),null);
});
test("audio windows do not classify from a single transient sample",()=>{
  assert.equal(summarizeAudioWindow([.1]).state,"unknown");
  assert.equal(summarizeAudioWindow(Array(12).fill(0)).state,"silence");
  assert.equal(summarizeAudioWindow(Array(12).fill(.05)).state,"signal");
  assert.equal(summarizeAudioWindow(Array(12).fill(NaN)).state,"unknown");
});
