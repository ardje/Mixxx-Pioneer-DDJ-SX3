// Pioneer DDJ-SX2 mapping for Mixxx
// based on hrudham's mapping for the DDJ-SR
// modifications by tildearrow
// todo:
// clear beatgrid button
// browser back button
// improvements to crossfader curve
// "parameters"
// deck switching?
// and fix the comments, because my excess copy/pasting made some comments really wrong (like, "headphone cue led" in "slip button led" LOL)
// thanks to:
// hrudham for making the DDJ-SR mapping
// pioneer for making such an awesome controller

var PioneerDDJSX2 = function() { }

var serato=[ 0xF0, 0x00, 0x20, 0x7f, 0x50, 0x01, 0xF7 ];
var initstring=[ 0xF0, 0x00, 0x20, 0x7f, 0x03, 0x01, 0xF7 ];
var oldbeat=[0,0,0,0];
var beat=[0,0,0,0];
var pospos1=0;
var oldpospos1=0;
var pospos2=0;
var oldpospos2=0;
var pospos3=0;
var oldpospos3=0;
var pospos4=0;
var oldpospos4=0;
var groooup=0;
var issynced1=0;
var issynced2=0;
var issynced3=0;
var issynced4=0;
var AreWeInShiftMode=0;
var tiltstatus=0;
var AdjustMode=[0,0,0,0];
var SlideMode=[0,0,0,0];
var PadMode=[0,0,0,0];
var TurnTablePos=[0,0,0,0];
var SlipShowerStatus=0;
var slicerlfsrseed=0;
var slicerlfsrsequence=[0];
var slicerstatus=[0,0,0,0];
var slicerdelta=[0,0,0,0];
var slicerbutton=[0,0,0,0];
var slicerbuttonold=[0,0,0,0];
var slicerblank=[0,0,0,0];
var samplerVolume=1.0;
var sampleVolume=[0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5];

var whohandlesdelta=[0,0,0,0];
var slicertype=[0,0,0,0];
var slicergain=[0,0,0,0];
var slicerpost=[0,0,0,0];
var HCLOn=[0,0,0,0];
var HCLNum=[0,0,0,0];
var slicerlightforce=[0,0,0,0];
var sampleplaying=[0,0,0,0,0,0,0,0];
var oldsampleplaying=[0,0,0,0,0,0,0,0];
var slicertimer;
var sampleplaying1=[0,0,0,0,0,0,0,0];
var oldsampleplaying1=[0,0,0,0,0,0,0,0];
var GridSlide=[0,0,0,0];
var GridAdjust=[0,0,0,0];
var IgnoreBA=[0,0,0,0];
var IgnoreBC=[0,0,0,0];

var currenteffect=[0,0];
var currenteffectparamset=[0,0,0,0,0,0,0,0];
var selectedpanel=0;
var reverse=[0,0,0,0];
var lt=[[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]];
var lttimer=0;
// 0: min 1/32, 1: min 1/16, 2: min 1/8, etc.
var rollPrec=[2,2,2,2];
// 0: 8% of max, 1: 16% of max, 2: 50% of max 3: 90% of max
var tempoRange=[0,0,0,0];

// new slicer variables
var slicersched=[0,0,0,0];
var wherewerewe=[0,0,0,0];
var sliceractive=[0,0,0,0];
var whohandles=[0,0,0,0];

function doTimer() {
        if (!PioneerDDJSX2.settings.DoNotTrickController) {
        midi.sendSysexMsg(serato,serato.length);
        }
        engine.beginTimer(250, "doTimer", 1);
        for (var i=0; i<4; i++) {
        if (!engine.getValue("[Channel"+(i+1)+"]","play")) {
            midi.sendShortMsg(0x90+i, 0x0b, (tiltstatus && engine.getValue("[Channel"+(i+1)+"]","track_samples")>0)?0x7f:0x00);
            if (engine.getValue("[Channel"+(i+1)+"]","cue_point")!=(engine.getValue("[Channel"+(i+1)+"]","playposition")*engine.getValue("[Channel"+(i+1)+"]","track_samples"))) {
                midi.sendShortMsg(0x90+i, 0x0c, (tiltstatus && engine.getValue("[Channel"+(i+1)+"]","track_samples")>0)?0x7f:0x00);
            } else {
                midi.sendShortMsg(0x90+i, 0x0c, 0x7f);
            }
        }
        if (engine.getValue("[Channel"+(i+1)+"]","slip_enabled")) {
           midi.sendShortMsg(0x90 + i, 0x40, tiltstatus ? 0x7F : 0x00);
        } else {
             midi.sendShortMsg(0x90 + i, 0x40, 0x00);
        }
        if (reverse[i]) {
            midi.sendShortMsg(0x90+i,0x38,tiltstatus?0x7f:0x00);
            midi.sendShortMsg(0x90+i,0x15,tiltstatus?0x7f:0x00);
        } else {
            midi.sendShortMsg(0x90+i,0x38,0x00);
            midi.sendShortMsg(0x90+i,0x15,0x00);
        }
        if (HCLOn[i]) {
          midi.sendShortMsg(0x96+i, 0x40+HCLNum[i], (tiltstatus)?0x7f:0x00);
          midi.sendShortMsg(0x96+i, 0x48+HCLNum[i], (tiltstatus)?0x7f:0x00);
        }
        }
        for (var i=0; i<8; i++) {
          // sampler check
            oldsampleplaying1[i]=sampleplaying1[i];
            sampleplaying1[i]=engine.getValue("[Sampler"+(i+1)+"]","play");
        if (sampleplaying1[i]) {
            midi.sendShortMsg(0x97, 0x30+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x97, 0x70+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x98, 0x30+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x98, 0x70+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x99, 0x30+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x99, 0x70+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x9a, 0x30+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x9a, 0x70+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x97, 0x38+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x97, 0x78+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x98, 0x38+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x98, 0x78+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x99, 0x38+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x99, 0x78+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x9a, 0x38+i, (tiltstatus)?0x7f:0x00);
            midi.sendShortMsg(0x9a, 0x78+i, (tiltstatus)?0x7f:0x00);
        } else {
            oldsampleplaying[i]=sampleplaying[i];
            sampleplaying[i]=(engine.getValue("[Sampler"+(i+1)+"]","track_samples")>0);
            if (oldsampleplaying[i]!=sampleplaying[i] || oldsampleplaying1[i]!=sampleplaying1[i]) {
            midi.sendShortMsg(0x97, 0x30+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x97, 0x70+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x98, 0x30+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x98, 0x70+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x99, 0x30+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x99, 0x70+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x9a, 0x30+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x9a, 0x70+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x97, 0x38+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x97, 0x78+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x98, 0x38+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x98, 0x78+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x99, 0x38+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x99, 0x78+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x9a, 0x38+i, (sampleplaying[i])?(0x7f):(0x00));
            midi.sendShortMsg(0x9a, 0x78+i, (sampleplaying[i])?(0x7f):(0x00));
            }
        }
        }
        if (tiltstatus==0) {tiltstatus=1;} else {tiltstatus=0;}
}

PioneerDDJSX2.init = function(id)
{
	var alpha = 1.0 / 8;
	print(id);
	PioneerDDJSX2.channels = 
		{	
			0x00: {},
			0x01: {},
			0x02: {},
			0x03: {}
		};
	
	PioneerDDJSX2.settings = 
		{
			alpha: alpha,
			beta: alpha / 32,
			jogResolution: 2054, // 2054 for accurate scratches (until we find a more accurate value)
			vinylSpeed: 33 + 1/3,
			loopIntervals: ['0.03125', '0.0625', '0.125', '0.25', '0.5', '1', '2', '4', '8', '16', '32', '64'],
                        tempoRanges: [0.08,0.16,0.5,0.9],
                        hotCueColors: [0x2A,0x24,0x01,0x1D,0x15,0x37,0x08,0x3A], // set to [0x2A,0x24,0x01,0x1D,0x15,0x37,0x08,0x3A] for serato defaults
                        rollColors: [0x1d, 0x16, 0x13, 0x0d, 0x05],
			safeScratchTimeout: 20, // 20ms is the minimum allowed here.
			CenterLightBehavior: 1, // 0 for rotations, 1 for beats, -1 to disable
			DoNotTrickController: 0 // enable this to stop tricking your controller into "this is serato" hahaha... but be careful as enabling this will disable the red light and spin sync and the slip shower
		};
		
	PioneerDDJSX2.enumerations = 
		{
			rotarySelector:
				{
					targets:
						{
							libraries: 0,
							tracklist: 1
						}
				},
			channelGroups:
				{
					'[Channel1]': 0x00,
					'[Channel2]': 0x01,
					'[Channel3]': 0x02,
					'[Channel4]': 0x03
				}
		};
		
	PioneerDDJSX2.status = 
		{
			rotarySelector: 
				{
					target: PioneerDDJSX2.enumerations.rotarySelector.targets.tracklist
				}
		};
                        // disable all lights, i guess
                
                //midi.sendShortMsg(0xbb, 0x09, 0x7f);
                engine.beginTimer(20, "doTimer", 1);
                        /*midi.sendShortMsg(0xbc, 0x07, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x06, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x05, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x04, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x03, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x02, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x01, 0x00); // decoration thing
                        midi.sendShortMsg(0xbc, 0x00, 0x00); // decoration thing*/
                        
                        /*midi.sendShortMsg(0xb3, 0x02, 0x7f); // decoration thing
                        midi.sendShortMsg(0xb2, 0x02, 0x7f); // decoration thing
                        midi.sendShortMsg(0xb1, 0x02, 0x7f); // decoration thing
                        midi.sendShortMsg(0xb0, 0x02, 0x7f); // decoration thing
                           engine.beginTimer(400, function() {
                        midi.sendShortMsg(0xb3, 0x02, 0x00); // decoration thing
                        midi.sendShortMsg(0xb2, 0x02, 0x00); // decoration thing
                        midi.sendShortMsg(0xb1, 0x02, 0x00); // decoration thing
                        midi.sendShortMsg(0xb0, 0x02, 0x00); // decoration thing
                        print("done");
                           },1);*/
                        
                        
                        midi.sendShortMsg(0x90, 0x0b, 0x10); // decoration thing
                        midi.sendShortMsg(0x91, 0x0b, 0x10); // decoration thing
                        midi.sendShortMsg(0x92, 0x0b, 0x10); // decoration thing
                        midi.sendShortMsg(0x93, 0x0b, 0x10); // decoration thing
				midi.sendShortMsg(0x90, 0x1b, 0x7f);
                                midi.sendShortMsg(0x91, 0x1b, 0x7f);
                                midi.sendShortMsg(0x92, 0x1b, 0x7f);
                                midi.sendShortMsg(0x93, 0x1b, 0x7f);
	PioneerDDJSX2.BindControlConnections(false);
        //midi.sendSysexMsg(initstring,initstring.length);
        // increase resonance of filter, so that mixxx becomes more serato-like HAHAHA
        engine.setValue("[QuickEffectRack1_[Channel1]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel2]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel3]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel4]_Effect1]","parameter2",4);
        // disable deck lights
        midi.sendShortMsg(0xbb, 0, 0);
        midi.sendShortMsg(0xbb, 1, 0);
        midi.sendShortMsg(0xbb, 2, 0);
        midi.sendShortMsg(0xbb, 3, 0);
        midi.sendShortMsg(0xbb, 4, 0);
        midi.sendShortMsg(0xbb, 5, 0);
        midi.sendShortMsg(0xbb, 6, 0);
        midi.sendShortMsg(0xbb, 7, 0);
        // set tempo range
        for (var i=0; i<4; i++) {
          engine.setParameter("[Channel"+(i+1)+"]","rateRange",PioneerDDJSX2.settings.tempoRanges[tempoRange[i]]);
        }
        // and finally, change leds to mixxx's status
        // will be done
}
    

PioneerDDJSX2.BindControlConnections = function(isUnbinding)
{
	for (var channelIndex = 1; channelIndex <= 4; channelIndex++)
	{
		var channelGroup = '[Channel' + channelIndex + ']';
	
		// Hook up the VU meters
		engine.connectControl(channelGroup, 'VuMeter', 'PioneerDDJSX2.vuMeter', isUnbinding);
                // the disc lights
                engine.connectControl(channelGroup, 'playposition', 'PioneerDDJSX2.deckLights', isUnbinding);
		
		// Play / Pause LED
		engine.connectControl(channelGroup, 'play', 'PioneerDDJSX2.PlayLeds', isUnbinding);
		engine.connectControl(channelGroup, 'sync_enabled', 'PioneerDDJSX2.SyncLights', isUnbinding);
		// Cue LED
		engine.connectControl(channelGroup, 'cue_default', 'PioneerDDJSX2.CueLeds', isUnbinding);
		
		// PFL / Headphone Cue LED
		engine.connectControl(channelGroup, 'pfl', 'PioneerDDJSX2.HeadphoneCueLed', isUnbinding);
		
		// Keylock LED
		engine.connectControl(channelGroup, 'keylock', 'PioneerDDJSX2.KeyLockLeds', isUnbinding);
                
                engine.connectControl(channelGroup, 'loop_double', 'PioneerDDJSX2.LoopDouble', isUnbinding);
                engine.connectControl(channelGroup, 'loop_halve', 'PioneerDDJSX2.LoopHalve', isUnbinding);
                
                //engine.connectControl(channelGroup, 'slip_enabled', 'PioneerDDJSX2.SlipButton', isUnbinding);
                
		engine.connectControl(channelGroup, 'rate', 'PioneerDDJSX2.RateThing', isUnbinding);
                engine.connectControl(channelGroup, 'beat_next', 'PioneerDDJSX2.BeatActive', isUnbinding);
                engine.connectControl(channelGroup, 'beat_closest', 'PioneerDDJSX2.BeatClosest', isUnbinding);
                //engine.connectControl(channelGroup, 'group_[Channel2]_enable', 'PioneerDDJSX2.FX1', isUnbinding);
                //engine.connectControl(channelGroup, 'group_[Channel3]_enable', 'PioneerDDJSX2.FX1', isUnbinding);
                //engine.connectControl(channelGroup, 'group_[Channel4]_enable', 'PioneerDDJSX2.FX1', isUnbinding);
                
                //engine.connectControl(channelGroup, '[EffectRack1_EffectUnit2],group_[Channel1]_enable', 'PioneerDDJSX2.FX2', isUnbinding);
                //engine.connectControl(channelGroup, '[EffectRack1_EffectUnit2],group_[Channel2]_enable', 'PioneerDDJSX2.FX2', isUnbinding);
                //engine.connectControl(channelGroup, '[EffectRack1_EffectUnit2],group_[Channel3]_enable', 'PioneerDDJSX2.FX2', isUnbinding);
                //engine.connectControl(channelGroup, '[EffectRack1_EffectUnit2],group_[Channel4]_enable', 'PioneerDDJSX2.FX2', isUnbinding);
                engine.connectControl(channelGroup, 'eject', 'PioneerDDJSX2.UnloadLights', isUnbinding);
                engine.connectControl(channelGroup, 'loop_enabled', 'PioneerDDJSX2.ReloopExit', isUnbinding);
                engine.connectControl(channelGroup, 'loop_in', 'PioneerDDJSX2.ReloopExit', isUnbinding);
                engine.connectControl(channelGroup, 'loop_out', 'PioneerDDJSX2.ReloopExit', isUnbinding);
                engine.connectControl(channelGroup, 'track_samples', 'PioneerDDJSX2.LoadActions', isUnbinding);
		// Hook up the hot cue performance pads
		for (var i = 0; i < 8; i++)
		{
			engine.connectControl(channelGroup, 'hotcue_' + (i + 1) +'_enabled', 'PioneerDDJSX2.HotCuePerformancePadLed', isUnbinding);
		}
		
		// the saved loop pads
		for (var i = 0; i < 8; i++)
		{
			engine.connectControl(channelGroup, 'hotcue_' + (16+(i*2)) +'_enabled', 'PioneerDDJSX2.SavedLoopLights', isUnbinding);
		}
		// Hook up the roll performance pads
		for (var interval in PioneerDDJSX2.settings.loopIntervals)
		{
			engine.connectControl(channelGroup, 'beatloop_' + interval + '_enabled', 'PioneerDDJSX2.RollPerformancePadLed', isUnbinding);
		}
	}
	engine.connectControl('[EffectRack1_EffectUnit1]', 'group_[Channel1]_enable', 'PioneerDDJSX2.FX1CH1', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit2]', 'group_[Channel1]_enable', 'PioneerDDJSX2.FX2CH1', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit1]', 'group_[Channel2]_enable', 'PioneerDDJSX2.FX1CH2', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit2]', 'group_[Channel2]_enable', 'PioneerDDJSX2.FX2CH2', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit1]', 'group_[Channel3]_enable', 'PioneerDDJSX2.FX1CH3', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit2]', 'group_[Channel3]_enable', 'PioneerDDJSX2.FX2CH3', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit1]', 'group_[Channel4]_enable', 'PioneerDDJSX2.FX1CH4', isUnbinding);
        engine.connectControl('[EffectRack1_EffectUnit2]', 'group_[Channel4]_enable', 'PioneerDDJSX2.FX2CH4', isUnbinding);
        engine.connectControl('[Microphone]', 'talkover', 'PioneerDDJSX2.MicLight', isUnbinding);
        engine.connectControl('[Master]', 'talkoverDucking', 'PioneerDDJSX2.MicDuck', isUnbinding);
};

PioneerDDJSX2.SyncLights = function(value, group, control)
{
     var channel = PioneerDDJSX2.enumerations.channelGroups[group];
        /*issynced1=0; issynced2=0; issynced3=0; issynced4=0;
        
        if (engine.getValue("[Channel1]","bpm")==engine.getValue("[Channel2]","bpm")) {
            issynced1=1;
            issynced2=1;
        } else {
            issynced1|=0;
            issynced2|=0;
        }
        
        if (engine.getValue("[Channel1]","bpm")==engine.getValue("[Channel3]","bpm")) {
            issynced1=1;
            issynced3=1;
        } else {
            issynced1|=0;
            issynced3|=0;
        }
        
        if (engine.getValue("[Channel1]","bpm")==engine.getValue("[Channel4]","bpm")) {
            issynced1=1;
            issynced4=1;
        } else {
            issynced1|=0;
            issynced4|=0;
        }
        
        if (engine.getValue("[Channel2]","bpm")==engine.getValue("[Channel3]","bpm")) {
            issynced2=1;
            issynced3=1;
        } else {
            issynced2|=0;
            issynced3|=0;
        }
        
        if (engine.getValue("[Channel2]","bpm")==engine.getValue("[Channel4]","bpm")) {
            issynced2=1;
            issynced4=1;
        } else {
            issynced2|=0;
            issynced4|=0;
        }
        
        if (engine.getValue("[Channel3]","bpm")==engine.getValue("[Channel4]","bpm")) {
            issynced3=1;
            issynced4=1;
        } else {
            issynced3|=0;
            issynced4|=0;
        }
        
        if (engine.getValue("[Channel1]","bpm")==0) {
            issynced1=0;
        }
        if (engine.getValue("[Channel2]","bpm")==0) {
            issynced2=0;
        }
        if (engine.getValue("[Channel3]","bpm")==0) {
            issynced3=0;
        }
        if (engine.getValue("[Channel4]","bpm")==0) {
            issynced4=0;
        }
        
        if (issynced1==1) {midi.sendShortMsg(0x90, 0x58, 0x7f);} else {midi.sendShortMsg(0x90, 0x58, 0x00);}
        if (issynced2==1) {midi.sendShortMsg(0x91, 0x58, 0x7f);} else {midi.sendShortMsg(0x91, 0x58, 0x00);}
        if (issynced3==1) {midi.sendShortMsg(0x92, 0x58, 0x7f);} else {midi.sendShortMsg(0x92, 0x58, 0x00);}
        if (issynced4==1) {midi.sendShortMsg(0x93, 0x58, 0x7f);} else {midi.sendShortMsg(0x93, 0x58, 0x00);}
           */
        midi.sendShortMsg(0x90+channel, 0x58, value?0x7f:0x00);
};

PioneerDDJSX2.RateThing = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (engine.getValue(group, 'rate')>0) {
            midi.sendShortMsg(0x90+channel, 0x34 , 0x7F); // ok
            midi.sendShortMsg(0x90+channel, 0x37 , 0x00); // Thing
        } else {
            if (engine.getValue(group, 'rate')==0) {
            midi.sendShortMsg(0x90+channel, 0x37 , 0x00); // Thing
            midi.sendShortMsg(0x90+channel, 0x34 , 0x00); // Thing
            } else {
               midi.sendShortMsg(0x90+channel, 0x37 , 0x7F); // Thing
            midi.sendShortMsg(0x90+channel, 0x34 , 0x00); // Thing 
            }
        }
        //PioneerDDJSX2.SyncLights();
};

PioneerDDJSX2.UnloadLights = function(value, group, control)
{
    var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
    // turn off all channel lights
    for (var k=0; k<0x30; k++) {
        midi.sendShortMsg(0x97+channel, k , 0x00);
    }
    for (var k=0x40; k<0x70; k++) {
        midi.sendShortMsg(0x97+channel, k , 0x00);
    }
    midi.sendShortMsg(0xbb, channel, 0);
    midi.sendShortMsg(0xbb, 4+channel, 0);
};

// This handles LEDs related to the PFL / Headphone Cue event.
PioneerDDJSX2.HeadphoneCueLed = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x90 + channel, 0x54, value ? 0x7F : 0x00); // Headphone Cue LED
};

// This handles sync enabling and disabling.
PioneerDDJSX2.SyncEnable = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (control==127) {
            print("do");
            engine.setValue("[Channel"+(value+1)+"]","sync_enabled",1);
        }
};

PioneerDDJSX2.SyncDisable = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (control==127) {
            print("do");
            engine.setValue("[Channel"+(value+1)+"]","sync_enabled",0);
        }
};

// This handles LEDs related to the PFL / Headphone Cue event- i mean, slip.
PioneerDDJSX2.slipenabled = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        print(value);
        //if (value==1) {SlipShowerStatus=0; groooup=channel; /*engine.beginTimer(20,"PioneerDDJSX2.Woah",1);*/} else {
        if (control==127) {
        if (engine.getValue("[Channel"+(value+1)+"]","play")) {
            engine.setValue("[Channel"+(value+1)+"]","slip_enabled",!engine.getValue("[Channel"+(value+1)+"]","slip_enabled"));
	midi.sendShortMsg(0x90 + value, 0x3e, engine.getValue("[Channel"+(value+1)+"]","slip_enabled") ? 0x7F : 0x00); // Headphone Cue LED
        } else {
            engine.setValue("[Channel"+(value+1)+"]","slip_enabled",!engine.getValue("[Channel"+(value+1)+"]","slip_enabled"));
        }
        }
        //}
};
PioneerDDJSX2.BeatActive = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        var howmuchshallwejump=0;
        // slicer
        if (!IgnoreBA[channel]) {
            if (sliceractive[channel] && !slicersched[channel]) {
                print("slicer off...");
                sliceractive[channel]=0;
                slicerbuttonold[channel]=0;
                whohandles[channel]=0;
                engine.setValue(group,"beatjump",-wherewerewe[channel]);
                wherewerewe[channel]=0;
            }
        if (slicersched[channel]) {
            // process schedule
            if (sliceractive[channel]) {
                // umm
                print("doing postslice");
                IgnoreBA[channel]=((-(beat[channel]%8)+slicerbutton[channel]-1)==0)?0:1;
                IgnoreBC[channel]=((-(beat[channel]%8)+slicerbutton[channel]-1)==0)?0:1;
                engine.setValue(group,"beatjump",-(beat[channel]%8)+slicerbutton[channel]-1);
                wherewerewe[channel]-=(slicerbuttonold[channel]-slicerbutton[channel])+1;
                slicerbuttonold[channel]=slicerbutton[channel];
                slicersched[channel]=0;
            } else {
                // ok
                print("doing slicer");
                whohandles[channel]=1;
                IgnoreBA[channel]=1;
                IgnoreBC[channel]=1;
                slicerbuttonold[channel]=slicerbutton[channel];
                wherewerewe[channel]=-(beat[channel]%8)+slicerbutton[channel]-1;
                engine.setValue(group,"beatjump",wherewerewe[channel]);
                slicersched[channel]=0;
                sliceractive[channel]=1;
            }
        }
        } else {
            print("IgnoreBAOff");
            IgnoreBA[channel]=0;
        }
        
        /* old slicer code, don't touch yet
        if (slicertype[channel]==0 || slicertype[channel]==2 || slicertype[channel]==3) {
        if (slicerstatus[channel]==2) {
            if (!IgnoreBA[channel]) {
                slicertype[channel]=0;
                slicerstatus[channel]=0;
                slicerpost[channel]=1;
                engine.setValue(group,"beatjump",slicerdelta[channel]);
                midi.sendShortMsg(0x97+channel, 0x20, ((Math.floor(beat[channel]%8))==0)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x21, ((Math.floor(beat[channel]%8))==1)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x22, ((Math.floor(beat[channel]%8))==2)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x23, ((Math.floor(beat[channel]%8))==3)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x24, ((Math.floor(beat[channel]%8))==4)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x25, ((Math.floor(beat[channel]%8))==5)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x26, ((Math.floor(beat[channel]%8))==6)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x27, ((Math.floor(beat[channel]%8))==7)?0x01:0x28);
                slicerdelta[channel]=0;
                sliceractive[channel]=0;
            } else {
                IgnoreBA[channel]=0;
            }
        }
        if (slicerstatus[channel]==1) {
            if (!IgnoreBA[channel]) {
                if (sliceractive[channel]) {
                    slicerdelta[channel]+=1;
                }
                slicertype[channel]=3;
                slicerstatus[channel]=2;
                sliceractive[channel]=1;
                if (((slicerbutton[channel]-1)-(beat[channel]%8))!=0) {
                    print("we are ignoring");
                IgnoreBA[channel]=1;
                IgnoreBC[channel]=1;
                
                } else {
                 slicerdelta[channel]-=1;   
                }
                engine.setValue(group,"beatjump",(slicerbutton[channel]-1)-(beat[channel]%8));
                if (whohandlesdelta[channel]==0) {
                if (slicerdelta[channel]==0) {
                    slicerdelta[channel]=-(slicerbutton[channel]-1-(beat[channel]%8));
                } else {
                    slicerdelta[channel]+=2;
                    print("SD2");
                }
                } else {
                    //slicerdelta[channel]-=0.5;
                }
                print("THE DELTA IS "+slicerdelta[channel]);
                print("channel is "+channel);
                midi.sendShortMsg(0x97+channel, 0x20, (slicerbutton[channel]==0)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x21, (slicerbutton[channel]==1)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x22, (slicerbutton[channel]==2)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x23, (slicerbutton[channel]==3)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x24, (slicerbutton[channel]==4)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x25, (slicerbutton[channel]==5)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x26, (slicerbutton[channel]==6)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x27, (slicerbutton[channel]==7)?0x01:0x28);
                //midi.sendShortMsg(0x97+channel, 0x20+, );
                midi.sendShortMsg(0x97+channel, 0x20+slicerbutton[channel]+slicerdelta[channel], 0x40);
                //slicerdelta[channel]=-slicerdelta[channel];
            } else {
                IgnoreBA[channel]=0;
            }
        }
        }
        */
	//print("beat active!");
        //print(group);
        // slicer lights
        print(value);
        oldbeat[channel]=beat[channel];
        beat[channel]=Math.round(value/engine.getValue(group,"track_samplerate")*(engine.getValue(group,"file_bpm")/120.0))-1;
        //print(beat[channel]%8+", "+oldbeat[channel]%8);
        if (PadMode[channel]==6 && (beat[channel]%8)==0 && (oldbeat[channel]%8)==7) {
            print("should jump");
            engine.setValue(group,"beatjump",-8);
        }
        if ((!slicerblank[channel] && slicerstatus[channel]==0 && slicerpost[channel]==0)/*||(slicerlightforce[channel]==1)*/) {
            // slicer lights, if we are in slicer mode
            if (PadMode[channel]==2) {
                print("sending lights");
        midi.sendShortMsg(0x97+channel, 0x20, ((Math.floor(beat[channel]%8))==0)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x21, ((Math.floor(beat[channel]%8))==1)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x22, ((Math.floor(beat[channel]%8))==2)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x23, ((Math.floor(beat[channel]%8))==3)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x24, ((Math.floor(beat[channel]%8))==4)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x25, ((Math.floor(beat[channel]%8))==5)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x26, ((Math.floor(beat[channel]%8))==6)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x27, ((Math.floor(beat[channel]%8))==7)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x28, ((Math.floor(beat[channel]%8))==0)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x29, ((Math.floor(beat[channel]%8))==1)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2a, ((Math.floor(beat[channel]%8))==2)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2b, ((Math.floor(beat[channel]%8))==3)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2c, ((Math.floor(beat[channel]%8))==4)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2d, ((Math.floor(beat[channel]%8))==5)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2e, ((Math.floor(beat[channel]%8))==6)?0x01:0x28);
        midi.sendShortMsg(0x97+channel, 0x2f, ((Math.floor(beat[channel]%8))==7)?0x01:0x28);
            }
            if (PadMode[channel]==6) {
                print("sending lights 1");
        // slicer loop lights
        midi.sendShortMsg(0x97+channel, 0x60, ((Math.floor(beat[channel]%8))==0)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x61, ((Math.floor(beat[channel]%8))==1)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x62, ((Math.floor(beat[channel]%8))==2)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x63, ((Math.floor(beat[channel]%8))==3)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x64, ((Math.floor(beat[channel]%8))==4)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x65, ((Math.floor(beat[channel]%8))==5)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x66, ((Math.floor(beat[channel]%8))==6)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x67, ((Math.floor(beat[channel]%8))==7)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x68, ((Math.floor(beat[channel]%8))==0)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x69, ((Math.floor(beat[channel]%8))==1)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6a, ((Math.floor(beat[channel]%8))==2)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6b, ((Math.floor(beat[channel]%8))==3)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6c, ((Math.floor(beat[channel]%8))==4)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6d, ((Math.floor(beat[channel]%8))==5)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6e, ((Math.floor(beat[channel]%8))==6)?0x28:0x01);
        midi.sendShortMsg(0x97+channel, 0x6f, ((Math.floor(beat[channel]%8))==7)?0x28:0x01);
            }
        if (slicerlightforce[channel]==1) {slicerlightforce[channel]=0;}
        } else {
            slicerpost[channel]=0;
        }
        // center deck light, if mode set to 1
        if (PioneerDDJSX2.settings.CenterLightBehavior==1) {
        midi.sendShortMsg(0xbb, 0x04+channel,1+(beat[channel]%8));
        }
        //midi.sendShortMsg(0x90, 0x24,  0x7f);
};

PioneerDDJSX2.BeatClosest = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (!IgnoreBC[channel]) {
            if (sliceractive[channel] && !slicersched[channel]) {
                if (whohandles[channel]==2 && slicertype[channel]==1) {
                print("slicer off..1.");
                sliceractive[channel]=0;
                slicerbuttonold[channel]=0;
                whohandles[channel]=0;
                engine.setValue(group,"beatjump",-wherewerewe[channel]);
                wherewerewe[channel]=0;
                }
            }
            if (slicersched[channel]) {
                if (sliceractive[channel]) {
                    print("postslice in HB");
                IgnoreBA[channel]=((-(beat[channel]%8)+slicerbutton[channel]-1)==0)?0:1;
                IgnoreBC[channel]=((-(beat[channel]%8)+slicerbutton[channel]-1)==0)?0:1;
                engine.setValue(group,"beatjump",-(beat[channel]%8)+slicerbutton[channel]-0.5);
                wherewerewe[channel]-=(slicerbuttonold[channel]-slicerbutton[channel])+0.5;
                slicerbuttonold[channel]=slicerbutton[channel];
                slicersched[channel]=0;
                } else {
                    // ok
                print("doing slicer, halfbeat");
                whohandles[channel]=2;
                IgnoreBA[channel]=1;
                IgnoreBC[channel]=1;
                slicerbuttonold[channel]=slicerbutton[channel];
                wherewerewe[channel]=-(beat[channel]%8)+slicerbutton[channel]-0.5;
                slicergain[channel]=Math.pow(engine.getValue(group,"VuMeter"),2.5);
                print(slicergain[channel]);
                slicertype[channel]=(Math.floor(beat[channel]%8)!=7 && !(Math.round(slicergain[channel])))?2:1;
                engine.setValue(group,"beatjump",wherewerewe[channel]);
                slicersched[channel]=0;
                sliceractive[channel]=1;
                }
            }
        } else {
            print("IgnoreBCOff");
            IgnoreBC[channel]=0;
        }
	//print("beat active, in the middle!");
        //midi.sendShortMsg(0x90, 0x24, 0x00);
        /*
         * 
         * 
         * if (slicertype[channel]==0 || slicertype[channel]==1) {
            //print("doing slicer, slicerstatus: "+slicerstatus[channel]);
        if (slicerstatus[channel]==2) {
            
            if (!slicerblank[channel]) {
                slicerstatus[channel]=0;
                engine.setValue(group,"beatjump",slicerdelta[channel]);
                slicerdelta[channel]=0;
                slicertype[channel]=0;
            } else {
                slicerblank[channel]=0;
            }
        }
        if (slicerstatus[channel]==1) {
            print("doing comparison");
            if (!slicerblank[channel]) {
                print("sb is 0");
                slicerstatus[channel]=2;
                slicergain[channel]=Math.pow(engine.getValue(group,"VuMeter"),2.5);
                print(slicergain[channel]);
                slicertype[channel]=(Math.floor(beat[channel]%8)!=7 && !(Math.round(slicergain[channel])))?2:1;
                print("SLICER TYPE: "+((slicertype[channel]==2)?("long"):("short")));
                //if (slicertype[channel]==2) {
                // slicerlightforce[channel]=1;
                 //slicerdelta[channel]+=0.5;
                //}
                engine.setValue(group,"beatjump",(slicerbutton[channel]-0.5)-(beat[channel]%8));
                if (whohandlesdelta[channel]==1) {
                if (slicerdelta[channel]==0) {
                    slicerdelta[channel]=-(slicerbutton[channel]-0.5-(beat[channel]%8));
                } else {
                    slicerdelta[channel]-=0.5;
                }
                }
                slicerblank[channel]=1;
                print("midslice");
                print(slicerdelta[channel]);
                print("channel is "+channel);
                midi.sendShortMsg(0x97+channel, 0x20, (slicerbutton[channel]==0)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x21, (slicerbutton[channel]==1)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x22, (slicerbutton[channel]==2)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x23, (slicerbutton[channel]==3)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x24, (slicerbutton[channel]==4)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x25, (slicerbutton[channel]==5)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x26, (slicerbutton[channel]==6)?0x01:0x28);
                midi.sendShortMsg(0x97+channel, 0x27, (slicerbutton[channel]==7)?0x01:0x28);
                //midi.sendShortMsg(0x97+channel, 0x20+slicerbutton[channel], 0x40);
                midi.sendShortMsg(0x97+channel, 0x20+slicerbutton[channel]+slicerdelta[channel], 0x40);
                //slicerdelta[channel]=-slicerdelta[channel];
            } else {
                print("sb is 1");
                slicerblank[channel]=0;
            }
        }
        }*/
        
};

// This handles LEDs related to the PFL / Headphone Cue event.
PioneerDDJSX2.deckLights = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        //print("happened "+value);
        TurnTablePos[channel]=(engine.getValue(group,"playposition")*(engine.getValue(group,"track_samples")/engine.getValue(group,"track_samplerate"))/2);
        //print(TurnTablePos[channel]);
	midi.sendShortMsg(0xbb, channel, 1+(TurnTablePos[channel]*39.96)%0x48); // Headphone Cue LED
        // red led in the center
        if (PioneerDDJSX2.settings.CenterLightBehavior==0) {
        midi.sendShortMsg(0xbb, 0x04+channel,(1+Math.floor((engine.getValue(group,"playposition")*(engine.getValue(group,"track_samples")/engine.getValue(group,"track_samplerate"))/2)*39.96)/0x48)%8);
        }
};

// This handles the crossfader curve.
PioneerDDJSX2.CrossfaderCurve = function(value, group, control) 
{
	engine.setValue("[Mixer Profile]","xFaderCurve",control/16);
};

// This handles LEDs related to the loop double event.
PioneerDDJSX2.LoopDouble = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x90 + channel, 0x13, value ? 0x7F : 0x00); // Headphone Cue LED
};

// This handles LEDs related to the loop halve event.
PioneerDDJSX2.LoopHalve = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x90 + channel, 0x12, value ? 0x7F : 0x00); // Headphone Cue LED
};

// This handles LEDs- I'm tired.
PioneerDDJSX2.SlipMode = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (engine.getValue(group,"play")) {
	midi.sendShortMsg(0x90 + channel, 0x40, value ? 0x7F : 0x00); // Headphone Cue LED
        }
}; // reloop_exit

PioneerDDJSX2.LoadActions = function(value, group, control)
{
    print("we're loading");
    var channel = PioneerDDJSX2.enumerations.channelGroups[group];
    if (value) {
        // load animation
        midi.sendShortMsg(0x9b, channel, 0x7F);
        // fixxx
        engine.setValue("[QuickEffectRack1_[Channel1]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel2]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel3]_Effect1]","parameter2",4);
        engine.setValue("[QuickEffectRack1_[Channel4]_Effect1]","parameter2",4);
    }
};

// This handles LEDs related- no wait.
PioneerDDJSX2.ReloopExit = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];
	midi.sendShortMsg(0x90 + channel, 0x14, engine.getValue(group,"loop_enabled") ? 0x7F : 0x00);
        midi.sendShortMsg(0x90 + channel, 0x10, (engine.getValue(group,"loop_start_position")>-1) ? 0x7F : 0x00);
        midi.sendShortMsg(0x90 + channel, 0x11, (engine.getValue(group,"loop_end_position")>-1) ? 0x7F : 0x00);
        // saved loop lights
        PioneerDDJSX2.SavedLoopLights(0, group, control);
}; // reloop_exit

PioneerDDJSX2.SavedLoopLights =  function(value, group, control)
{
    print("sll");
    var channel = PioneerDDJSX2.enumerations.channelGroups[group];
    for (var iiiii=0; iiiii<8; iiiii++) {
        midi.sendShortMsg(0x97+channel,0x50+iiiii,(engine.getValue(group,"hotcue_"+(16+(iiiii*2))+"_position")>-1) ? (engine.getValue(group,"hotcue_"+(16+(iiiii*2))+"_position")==engine.getValue(group,"loop_start_position")?0x01:0x7f) : 0x00);
    }
    for (var iiiii=0; iiiii<8; iiiii++) {
        midi.sendShortMsg(0x97+channel,0x58+iiiii,(engine.getValue(group,"hotcue_"+(16+(iiiii*2))+"_position")>-1) ? (engine.getValue(group,"hotcue_"+(16+(iiiii*2))+"_position")==engine.getValue(group,"loop_start_position")?0x01:0x7f) : 0x00);
    }
};

// This handles LEDs related to fx1 ch1 event
PioneerDDJSX2.FX1CH1 = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            midi.sendShortMsg(0x96, 0x4C , value ? 0x7F : 0x00); // Thing
};

// This handles-
PioneerDDJSX2.MicLight = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
    print(value);
        midi.sendShortMsg(0x90, 0x4b , value ? 0x7F : 0x00); // Thing
};

PioneerDDJSX2.MicDuck = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
    print(value);
        midi.sendShortMsg(0x90, 0x4a , value ? 0x7F : 0x00); // Thing
};

// *yawn*
PioneerDDJSX2.FX2CH1 = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x96, 0x50, value ? 0x7F : 0x00); // Thing
};

PioneerDDJSX2.FX1CH2 = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            midi.sendShortMsg(0x96, 0x4D , value ? 0x7F : 0x00); // Thing
};

// ZzZzZz.......
PioneerDDJSX2.FX2CH2 = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x96, 0x51, value ? 0x7F : 0x00); // Thing
};

PioneerDDJSX2.FX1CH3 = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            midi.sendShortMsg(0x96, 0x4E , value ? 0x7F : 0x00); // Thing
};

//
PioneerDDJSX2.FX2CH3 = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x96, 0x52, value ? 0x7F : 0x00); // Thing
};

PioneerDDJSX2.FX1CH4 = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            midi.sendShortMsg(0x96, 0x4F , value ? 0x7F : 0x00); // Thing
};

//
PioneerDDJSX2.FX2CH4 = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x96, 0x53, value ? 0x7F : 0x00); // Thing
};

//
PioneerDDJSX2.CueLeds = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
        if (control == 'reloop_exit') {
	midi.sendShortMsg(0x90 + channel, 0x0C, 0x7F); // Cue LED
        } else {
        midi.sendShortMsg(0x9b, 0x10 + channel, 0x00); // Cue LED in deck
        }
};

// *wakes up* keylock event.
PioneerDDJSX2.KeyLockLeds = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x90 + channel, 0x1A, value ? 0x7F : 0x00); // Keylock LED
};

// This handles the shift thingy
PioneerDDJSX2.Shift = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            AreWeInShiftMode=control;
            print(AreWeInShiftMode);
};

// This handles the
PioneerDDJSX2.EffectSelect = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            print(value);
            if (currenteffect[value-4]<3) {
            engine.setValue("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]","effect_selector",(control==127)?(-1):(1));
            } else {
                engine.setValue("[EffectRack1_EffectUnit"+(value-3)+"]","chain_selector",(control==127)?(-1):(1));
            }
};

PioneerDDJSX2.Reverse = function(value, group, control) 
{
        if (control==127) {	
            reverse[value]=!reverse[value];
            engine.setValue("[Channel"+(value+1)+"]","reverse",reverse[value]);
        }
};

PioneerDDJSX2.AutoLoop = function(channel, control, value, status) 
{
    if (value==127) {
	if (engine.getValue("[Channel"+(channel+1)+"]","loop_enabled")) {
            engine.setValue("[Channel"+(channel+1)+"]","reloop_exit",1);
        } else {
            engine.setValue("[Channel"+(channel+1)+"]","beatloop_0.25_toggle",1);
        }
    }
};

PioneerDDJSX2.CCC = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];
    if (control==127) {
            currenteffect[value-4]++;
            if (currenteffect[value-4]>3) {
                currenteffect[value-4]=0;
            }
            print(value);
            PioneerDDJSX2.CCCLeds();
    }
};

PioneerDDJSX2.CCCLeds = function()
{
    // change indicator
            midi.sendShortMsg(0x94, 0x47, (currenteffect[0]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x48, (currenteffect[0]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x49, (currenteffect[0]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x4a, (currenteffect[0]==3) ? 0x7F : 0x00);
            if (currenteffect[0]<3) {
            midi.sendShortMsg(0x94, 0x63, (currenteffectparamset[currenteffect[0]]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x64, (currenteffectparamset[currenteffect[0]]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x65, (currenteffectparamset[currenteffect[0]]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x66, (currenteffectparamset[currenteffect[0]]==3) ? 0x7F : 0x00);
            } else {
            midi.sendShortMsg(0x94, 0x63, 0x7F);
            midi.sendShortMsg(0x94, 0x64, 0x7F);
            midi.sendShortMsg(0x94, 0x65, 0x7F);
            midi.sendShortMsg(0x94, 0x66, 0x7F);
            }
            midi.sendShortMsg(0x95, 0x47, (currenteffect[1]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x48, (currenteffect[1]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x49, (currenteffect[1]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x4a, (currenteffect[1]==3) ? 0x7F : 0x00);
            if (currenteffect[1]<3) {
            midi.sendShortMsg(0x95, 0x63, (currenteffectparamset[4+currenteffect[1]]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x64, (currenteffectparamset[4+currenteffect[1]]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x65, (currenteffectparamset[4+currenteffect[1]]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x66, (currenteffectparamset[4+currenteffect[1]]==3) ? 0x7F : 0x00);
            } else {
            midi.sendShortMsg(0x95, 0x63, 0x7F);
            midi.sendShortMsg(0x95, 0x64, 0x7F);
            midi.sendShortMsg(0x95, 0x65, 0x7F);
            midi.sendShortMsg(0x95, 0x66, 0x7F);
            }
            if (lttimer!=0) {
                engine.stopTimer(lttimer);
            lttimer=0;
            }
};

PioneerDDJSX2.CPS = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];
    if (control==127) {
            currenteffectparamset[((value==5)?(4):(0))+currenteffect[value-4]]++;
            if (currenteffectparamset[((value==5)?(4):(0))+currenteffect[value-4]]>=(engine.getValue("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]","num_parameters")/3)) {
                currenteffectparamset[((value==5)?(4):(0))+currenteffect[value-4]]=0;
            }
            print(currenteffectparamset[currenteffect[0]]);
            // change indicator
            midi.sendShortMsg(0x94, 0x63, (currenteffectparamset[currenteffect[0]]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x64, (currenteffectparamset[currenteffect[0]]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x65, (currenteffectparamset[currenteffect[0]]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x94, 0x66, (currenteffectparamset[currenteffect[0]]==3) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x63, (currenteffectparamset[4+currenteffect[1]]==0) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x64, (currenteffectparamset[4+currenteffect[1]]==1) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x65, (currenteffectparamset[4+currenteffect[1]]==2) ? 0x7F : 0x00);
            midi.sendShortMsg(0x95, 0x66, (currenteffectparamset[4+currenteffect[1]]==3) ? 0x7F : 0x00);
    }
};

PioneerDDJSX2.EffectKnob = function(value, group, control) 
{
    if (currenteffect[value-4]==3) {
        switch (group) {
        case 4:
          engine.setValue("[EffectRack1_EffectUnit"+(value-3)+"]", "super1", control/127);
        break;
        case 6:
          engine.setValue("[EffectRack1_EffectUnit"+(value-3)+"]", "mix", control/127);
        break;
        //case 4: engine.setValue(); break;
        //case 6: engine.setValue(); break;
    }
    } else {
    switch (group) {
        case 2:
          engine.setParameter("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]", "parameter"+(1+(currenteffectparamset[((value-4)*4)+currenteffect[value-4]]*3)), control/127);
        break;
        case 4:
          engine.setParameter("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]", "parameter"+(2+(currenteffectparamset[((value-4)*4)+currenteffect[value-4]]*3)), control/127);
        break;
        case 6:
          engine.setParameter("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]", "parameter"+(3+(currenteffectparamset[((value-4)*4)+currenteffect[value-4]]*3)), control/127);
        break;
        //case 4: engine.setValue(); break;
        //case 6: engine.setValue(); break;
    }
    }
};

PioneerDDJSX2.EffectButton = function(value, group, control) 
{
    if (control==127) {
        if (((currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71)<engine.getValue("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]","num_parameters")) {
        lt[value-4][currenteffect[value-4]][(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71]++; if (lt[value-4][currenteffect[value-4]][(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71]>4) {lt[value-4][currenteffect[value-4]][(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71]=0;}
    engine.setValue("[EffectRack1_EffectUnit"+(value-3)+"_Effect"+(currenteffect[value-4]+1)+"]","parameter"+((currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-70)+"_link_type",
        lt[value-4][currenteffect[value-4]][(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71]
    );
    PioneerDDJSX2.LinkTypeLeds(value-4,currenteffect[value-4],(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71);
    print(lt[value-4][currenteffect[value-4]][(currenteffectparamset[(4*(value-4))+currenteffect[value-4]]*3)+group-71]);
        } else {
         print("ok");   
        }
    }
};

PioneerDDJSX2.LinkTypeLeds = function(effectset, effect, param) 
{
    switch (lt[effectset][effect][param]) {
        case 0: midi.sendShortMsg(0x94+effectset, 0x47, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x48, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x49, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x4a, 0x00); break;
        case 1: midi.sendShortMsg(0x94+effectset, 0x47, 0x7f);
                midi.sendShortMsg(0x94+effectset, 0x48, 0x7f);
                midi.sendShortMsg(0x94+effectset, 0x49, 0x7f);
                midi.sendShortMsg(0x94+effectset, 0x4a, 0x7f); break;
        case 2: midi.sendShortMsg(0x94+effectset, 0x47, 0x7f);
                midi.sendShortMsg(0x94+effectset, 0x48, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x49, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x4a, 0x00); break;
        case 3: midi.sendShortMsg(0x94+effectset, 0x47, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x48, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x49, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x4a, 0x7f); break;
        case 4: midi.sendShortMsg(0x94+effectset, 0x47, 0x7f);
                midi.sendShortMsg(0x94+effectset, 0x48, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x49, 0x00);
                midi.sendShortMsg(0x94+effectset, 0x4a, 0x7f); break;
    }
    if (lttimer!=0) {
        engine.stopTimer(lttimer);
    }
    lttimer=engine.beginTimer(2000,"PioneerDDJSX2.CCCLeds",1);
};

PioneerDDJSX2.PanelSelect = function(value, group, control)
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];
    if (control==127) {
        // selectedpanel bitmap:
        // bit 0: samplers
        // bit 1: effect rack
        // bit 2: mixer
        // bit 3: 4 decks
        // bit 4: microphone
        // bit 5: preview deck
        // bit 6: stacked waveforms
        selectedpanel+=((1-(group-120))*2)-1;
        if (selectedpanel<0) {selectedpanel=127;}
        if (selectedpanel>127) {selectedpanel=0;}
        print(selectedpanel);
        engine.setValue("[Samplers]","show_samplers",selectedpanel&1);
        engine.setValue("[EffectRack1]","show",selectedpanel&2);
        engine.setValue("[Master]","hide_mixer",selectedpanel&4);
        engine.setValue("[Master]","show_4decks",selectedpanel&8);
        engine.setValue("[Microphone]","show_microphone",selectedpanel&16);
        engine.setValue("[PreviewDeck]","show_previewdeck",selectedpanel&32);
        engine.setValue("[Deere]","show_stacked_waveforms",selectedpanel&64);
    }
};

PioneerDDJSX2.EffectStuff = function(value, group, control) 
{
	//var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
            print("this should not appear, but value is "+value+" and group is "+group+" and control is "+control);
};

PioneerDDJSX2.SetGridSlide = function(value, group, control) 
{
	GridSlide[value]=control?1:0;
        midi.sendShortMsg(0x90 + value, 0x0a, control ? 0x7F : 0x00);
};

PioneerDDJSX2.SetGridAdjust = function(value, group, control) 
{
	GridAdjust[value]=control?1:0;
        midi.sendShortMsg(0x90 + value, 0x79, control ? 0x7F : 0x00);
};

PioneerDDJSX2.ClearGrid = function(value, group, control) 
{
	print("this is impossible");
        midi.sendShortMsg(0x90 + value, 0x79, control ? 0x7F : 0x00);
};

// This handles LEDs related to the play event.
PioneerDDJSX2.PlayLeds = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];	
	midi.sendShortMsg(0x90 + channel, 0x0B, value ? 0x7F : 0x00); // Play / Pause LED
	midi.sendShortMsg(0x90 + channel, 0x0C, value ? 0x7F : 0x00); // Cue LED
        if (PioneerDDJSX2.settings.DoNotTrickController) {
        midi.sendShortMsg(0x9B, 0x0c+channel, value ? 0x7F : 0x00); // play/pause animation
        }
        //midi.sendShortMsg(0xb0 + channel, 0x02, 0x40); // to test if it works
        //midi.sendShortMsg(0xbc + channel, 0x00, 0x40); // to test if it works
};

PioneerDDJSX2.SetHotCueMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("HOT CUE");
        PadMode[group]=0;
        midi.sendShortMsg(0x90 + deck, 0x1b, 0x7f);
    }
};

PioneerDDJSX2.SetRollMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group; 
        print("ROLL");
        PadMode[group]=1;
	midi.sendShortMsg(0x90 + deck, 0x1e, PioneerDDJSX2.settings.rollColors[rollPrec[group]]);
    }
};

PioneerDDJSX2.SetSlicerMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("SLICER");
        PadMode[group]=2;
	midi.sendShortMsg(0x90 + deck, 0x20, 0x7f);
        // update slicer lights
        beat[deck]=Math.round(engine.getValue("[Channel"+(group+1)+"]","beat_next")/engine.getValue("[Channel"+(group+1)+"]","track_samplerate")*(engine.getValue("[Channel"+(group+1)+"]","file_bpm")/120.0))-1;
        print("beat "+engine.getValue("[Channel"+(group+1)+"]","beat_closest"));
        midi.sendShortMsg(0x97+deck, 0x20, ((Math.floor(beat[deck]%8))==0)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x21, ((Math.floor(beat[deck]%8))==1)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x22, ((Math.floor(beat[deck]%8))==2)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x23, ((Math.floor(beat[deck]%8))==3)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x24, ((Math.floor(beat[deck]%8))==4)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x25, ((Math.floor(beat[deck]%8))==5)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x26, ((Math.floor(beat[deck]%8))==6)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x27, ((Math.floor(beat[deck]%8))==7)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x28, ((Math.floor(beat[deck]%8))==0)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x29, ((Math.floor(beat[deck]%8))==1)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2a, ((Math.floor(beat[deck]%8))==2)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2b, ((Math.floor(beat[deck]%8))==3)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2c, ((Math.floor(beat[deck]%8))==4)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2d, ((Math.floor(beat[deck]%8))==5)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2e, ((Math.floor(beat[deck]%8))==6)?0x01:0x28);
        midi.sendShortMsg(0x97+deck, 0x2f, ((Math.floor(beat[deck]%8))==7)?0x01:0x28);
    }
};

PioneerDDJSX2.SetSamplerMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("SAMPLER");
        PadMode[group]=3;
	midi.sendShortMsg(0x90 + deck, 0x22, 0x7f);
    }
};

PioneerDDJSX2.SetCueLoopMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("cue loop");
        PadMode[group]=4;
        midi.sendShortMsg(0x90 + deck, 0x69, 0x7f);
    }
};

PioneerDDJSX2.SetSavedLoopMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("saved loop");
        PadMode[group]=5;
	midi.sendShortMsg(0x90 + deck, 0x6b, 0x7f);
    }
};

PioneerDDJSX2.SetSlicerLoopMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group; 
        print("slicer loop");
        PadMode[group]=6;
	midi.sendShortMsg(0x90 + deck, 0x6d, 0x7f);
        // update slicer loop lights
        // update slicer lights
        beat[deck]=Math.round(engine.getValue("[Channel"+(group+1)+"]","beat_next")/engine.getValue("[Channel"+(group+1)+"]","track_samplerate")*(engine.getValue("[Channel"+(group+1)+"]","file_bpm")/120.0))-1;
        print("beat "+engine.getValue("[Channel"+(group+1)+"]","beat_closest"));
        midi.sendShortMsg(0x97+deck, 0x60, ((Math.floor(beat[deck]%8))==0)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x61, ((Math.floor(beat[deck]%8))==1)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x62, ((Math.floor(beat[deck]%8))==2)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x63, ((Math.floor(beat[deck]%8))==3)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x64, ((Math.floor(beat[deck]%8))==4)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x65, ((Math.floor(beat[deck]%8))==5)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x66, ((Math.floor(beat[deck]%8))==6)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x67, ((Math.floor(beat[deck]%8))==7)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x68, ((Math.floor(beat[deck]%8))==0)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x69, ((Math.floor(beat[deck]%8))==1)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6a, ((Math.floor(beat[deck]%8))==2)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6b, ((Math.floor(beat[deck]%8))==3)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6c, ((Math.floor(beat[deck]%8))==4)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6d, ((Math.floor(beat[deck]%8))==5)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6e, ((Math.floor(beat[deck]%8))==6)?0x28:0x01);
        midi.sendShortMsg(0x97+deck, 0x6f, ((Math.floor(beat[deck]%8))==7)?0x28:0x01);
    }
};

PioneerDDJSX2.SetVelocitySamplerMode = function(group, control, value, status) 
{
    if (value==127) {
	var deck = group;  
        print("velocity sampler");
        PadMode[group]=7;
	midi.sendShortMsg(0x90 + deck, 0x6f, 0x7f);
    }
};

PioneerDDJSX2.SetSampleGain = function(value, group, control) 
{
        sampleVolume[group-112]=control/127;
  engine.setParameter("[Sampler"+(group-111)+"]","pregain",samplerVolume*sampleVolume[group-112]);
	print("doing"+(group-112)+" "+control);
};

PioneerDDJSX2.SetSamplerVol = function(value, group, control) 
{
  print("setting");      
  samplerVolume=control/127;
  for (var i=0; i<8; i++) {
    engine.setParameter("[Sampler"+(i+1)+"]","pregain",samplerVolume*sampleVolume[i]);
  }
};

PioneerDDJSX2.SetTempoRange = function(group, control, value, status) 
{
  if (value==127) {
    tempoRange[group]++;
    if (tempoRange[group]>3) {
      tempoRange[group]=0;
    }
    print("setting tr "+tempoRange[group]);
    engine.setParameter("[Channel"+(group+1)+"]","rateRange",PioneerDDJSX2.settings.tempoRanges[tempoRange[group]]);
  }
};

PioneerDDJSX2.RollParam1L = function(group, control, value, status)
{
  if (value==127) {
    print("rp1l"+group);
    rollPrec[group]--;
    if (rollPrec[group]<0) {
      rollPrec[group]=0;
    }
    print("new rp: "+rollPrec[group]);
    midi.sendShortMsg(0x90 + group, 0x1e, PioneerDDJSX2.settings.rollColors[rollPrec[group]]);
  }
};

PioneerDDJSX2.RollParam1R = function(group, control, value, status)
{
  if (value==127) {
    print("rp1r"+group);
    rollPrec[group]++;
    if (rollPrec[group]>4) {
      rollPrec[group]=4;
    }
    print("new rp: "+rollPrec[group]);
    midi.sendShortMsg(0x90 + group, 0x1e, PioneerDDJSX2.settings.rollColors[rollPrec[group]]);
  }
};

// Lights up the LEDs for beat-loops.
PioneerDDJSX2.RollPerformancePadLed = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];
	
	var padIndex = 0;
	for (var i = 0; i < 8; i++)
	{
		if (control === 'beatloop_' + PioneerDDJSX2.settings.loopIntervals[i + 2] + '_enabled')
		{
			break;
		}
	
		padIndex++;
	}
	if (engine.getValue('[Channel1]', 'play')==true) {
	// Toggle the relevant Performance Pad LED
	midi.sendShortMsg(0x97 + channel, 0x10 + padIndex, value ? 0x7F : 0x00);
        }
};

PioneerDDJSX2.HotCuePerformancePadLed = function(value, group, control) 
{
	var channel = PioneerDDJSX2.enumerations.channelGroups[group];
	
	var padIndex = null;
        
        //for (var k = 0; k < 16; k++) {
        //for (var jjj = 0; jjj < 255; jjj++)
	//{
        //    midi.sendShortMsg(0x90 + k, jjj, 0x7f);
        //}
        //}
	for (var i = 1; i < 9; i++)
	{
		if (control === 'hotcue_' + i + '_enabled')
		{
				// Pad LED without shift key
	midi.sendShortMsg(0x97 + channel, 0x00 + i - 1, value ? PioneerDDJSX2.settings.hotCueColors[i-1] : 0x00);
	
	// Pad LED with shift key
	midi.sendShortMsg(0x97 + channel, 0x00 + i - 1 + 0x08, value ? PioneerDDJSX2.settings.hotCueColors[i-1] : 0x00);
        // Loop Pad LED without shift key
	midi.sendShortMsg(0x97 + channel, 0x40 + i - 1, value ? 0x7f : 0x00);
	
	// Loop Pad LED with shift key
	midi.sendShortMsg(0x97 + channel, 0x40 + i - 1 + 0x08, value ? 0x7f : 0x00);
		}
		
		padIndex = i;
	}
	
	// Pad LED without shift key
	//midi.sendShortMsg(0x97 + channel, 0x00 + padIndex, value ? 0x7F : 0x00);
	
	// Pad LED with shift key
	//midi.sendShortMsg(0x97 + channel, 0x00 + padIndex + 0x08, value ? 0x7F : 0x00);
};

// Set the VU meter levels.
PioneerDDJSX2.vuMeter = function(value, group, control) 
{
	// VU meter range is 0 to 127 (or 0x7F).
	var level = value*127;
	
	var channel = null;
	switch (group)
	{
		case '[Channel1]': 
			channel = 0xB0;
			break;
		case '[Channel2]': 
			channel = 0xB1;
			break;
                case '[Channel3]': 
			channel = 0xB2;
			break;
		case '[Channel4]': 
			channel = 0xB3;
			break;
	}
	
	midi.sendShortMsg(channel, 0x02, level);
}

// Work out the jog-wheel change / delta
PioneerDDJSX2.getJogWheelDelta = function(value)
{
	// The Wheel control centers on 0x40; find out how much it's moved by.
	return value - 0x40;
}

// Toggle scratching for a channel
PioneerDDJSX2.toggleScratch = function(channel, isEnabled)
{
	var deck = channel + 1; 
	if (isEnabled) 
	{
        engine.scratchEnable(
			deck, 
			PioneerDDJSX2.settings.jogResolution, 
			PioneerDDJSX2.settings.vinylSpeed, 
			PioneerDDJSX2.settings.alpha, 
			PioneerDDJSX2.settings.beta);
    }
    else 
	{
        engine.scratchDisable(deck);
    }
};

// Pitch bend a channel
PioneerDDJSX2.pitchBend = function(channel, movement) 
{
	var deck = channel + 1; 
	var group = '[Channel' + deck +']';
	
	// Make this a little less sensitive.
	movement = movement / 5; 
	// Limit movement to the range of -3 to 3.
	movement = movement > 3 ? 3 : movement;
	movement = movement < -3 ? -3 : movement;
	
	engine.setValue(group, 'jog', movement);	
};

// Schedule disabling scratch. We don't do this immediately on 
// letting go of the jog wheel, as that result in a pitch-bend.
// Instead, we set up a time that disables it, but cancel and
// re-register that timer whenever we need to to postpone the disable.
// Very much a hack, but it works, and I'm yet to find a better solution.
PioneerDDJSX2.scheduleDisableScratch = function(channel)
{
	PioneerDDJSX2.channels[channel].disableScratchTimer = engine.beginTimer(
		PioneerDDJSX2.settings.safeScratchTimeout, 
		'PioneerDDJSX2.toggleScratch(' + channel + ', false)', 
		true);
};

// If scratch-disabling has been schedule, then unschedule it.
PioneerDDJSX2.unscheduleDisableScratch = function(channel)
{
	if (PioneerDDJSX2.channels[channel].disableScratchTimer)
	{
		engine.stopTimer(PioneerDDJSX2.channels[channel].disableScratchTimer);
	}
};

// Postpone scratch disabling by a few milliseconds. This is
// useful if you were scratching, but let of of the jog wheel.
// Without this, you'd end up with a pitch-bend in that case.
PioneerDDJSX2.postponeDisableScratch = function(channel)
{
	PioneerDDJSX2.unscheduleDisableScratch(channel);
	PioneerDDJSX2.scheduleDisableScratch(channel);
};

// Detect when the user touches and releases the jog-wheel while 
// jog-mode is set to vinyl to enable and disable scratching.
PioneerDDJSX2.jogScratchTouch = function(channel, control, value, status) 
{
	if (value == 0x7F)
	{
		PioneerDDJSX2.unscheduleDisableScratch(channel);	
		PioneerDDJSX2.toggleScratch(channel, true);
	}
	else
	{
		PioneerDDJSX2.scheduleDisableScratch(channel);
	}
};

PioneerDDJSX2.jogSeek = function(channel, control, value, status) 
{
  print("seek "+PioneerDDJSX2.getJogWheelDelta(value));
  engine.setValue("[Channel"+(channel+1)+"]","beatjump",PioneerDDJSX2.getJogWheelDelta(value)/16);
};
 
// Scratch or seek with the jog-wheel.
PioneerDDJSX2.jogScratchTurn = function(channel, control, value, status) 
{
	var deck = channel + 1; 
    // Only scratch if we're in scratching mode, when 
	// user is touching the top of the jog-wheel.
    if (engine.isScratching(deck) && !GridSlide[channel] && !GridAdjust[channel]) 
	{
		engine.scratchTick(deck, PioneerDDJSX2.getJogWheelDelta(value));
	} else {
            if (GridSlide[channel]) {
                if (value<64) {
                    engine.setValue("[Channel"+deck+"]","beats_translate_earlier",1);
                } else {
                    engine.setValue("[Channel"+deck+"]","beats_translate_later",1);
                }
            print(value);
            }
            if (GridAdjust[channel]) {
                if (value<64) {
                    engine.setValue("[Channel"+deck+"]","beats_adjust_faster",1);
                } else {
                    engine.setValue("[Channel"+deck+"]","beats_adjust_slower",1);
                }
            print(value);
            }
        }
};

// Pitch bend using the jog-wheel, or finish a scratch when the wheel 
// is still turning after having released it.
PioneerDDJSX2.jogPitchBend = function(channel, control, value, status) 
{
	var deck = channel + 1; 
	var group = '[Channel' + deck +']';

	if (engine.isScratching(deck))
	{
		engine.scratchTick(deck, PioneerDDJSX2.getJogWheelDelta(value));
		PioneerDDJSX2.postponeDisableScratch(channel);
	}
	else
	{	
		// Only pitch-bend when actually playing
		if (engine.getValue(group, 'play'))
		{
			PioneerDDJSX2.pitchBend(channel, PioneerDDJSX2.getJogWheelDelta(value));
		}
	}
};

// Called when the jog-mode is not set to vinyl, and the jog wheel is touched.
PioneerDDJSX2.jogSeekTouch = function(channel, control, value, status) 
{
	var deck = channel + 1; 
	var group = '[Channel' + deck +']';
	
	// Only enable scratching if we're in scratching mode, when user is  
	// touching the top of the jog-wheel and the 'Vinyl' jog mode is 
	// selected.
	if (!engine.getValue(group, 'play'))
	{
		// Scratch if we're not playing; otherwise we'll be 
		// pitch-bending here, which we don't want.
		PioneerDDJSX2.toggleScratch(channel, value == 0x7F);
	}
};

// Call when the jog-wheel is turned. The related jogSeekTouch function 
// sets up whether we will be scratching or pitch-bending depending 
// on whether a song is playing or not.
PioneerDDJSX2.jogSeekTurn = function(channel, control, value, status) 
{
	var deck = channel + 1; 
    if (engine.isScratching(deck)) 
	{
		engine.scratchTick(deck, PioneerDDJSX2.getJogWheelDelta(value));
	}
	else
	{
		PioneerDDJSX2.pitchBend(channel, PioneerDDJSX2.getJogWheelDelta(value));
	}
};

// This handles the eight performance pads below the jog-wheels 
// that deal with the slicer. I took ages to make this. And still making.
PioneerDDJSX2.SlicerThing = function(performanceChannel, control, value, status) 
{
	var deck = performanceChannel - 7;  
	var group = '[Channel' + (deck+1) +']';
	//var interval = PioneerDDJSX2.settings.loopIntervals[control - 0x10 + 2];
        
	if (value == 0x7F)
	{
           /* if (slicertimer!=0) {
                engine.stopTimer(slicertimer);
                slicertimer=0;
            }
            slicerbutton[deck]=control-32;
            if (slicerstatus[deck]==0) {
                whohandlesdelta[deck]=((engine.getValue(group,"beat_distance"))<0.5)?(1):(0);
            } else {
                whohandlesdelta[deck]=((engine.getValue(group,"beat_distance"))<0.5)?(0):(1);
            }
            slicerstatus[deck]=1;
            slicertype[deck]=((engine.getValue(group,"beat_distance"))<0.5)?(1):(3);
            /*if (slicerstatus[deck]==0) {
            slicerdelta[deck]=-Math.floor((beat[deck]%8)-((control%64) - 0x20))-1;
            } else {
                slicerdelta[deck]=-slicerdelta[deck]-((slicertype[deck]==3)?1:0.5);
            }*/
           // slicerblank[deck]=0;
            //print("on, "+slicerdelta[deck]);
           // print("ST: "+slicertype[deck]);
           if (!slicersched[deck]) {
           slicersched[deck]=1;
           slicerbutton[deck]=(control-32)%8;
           print("slicer scheduled: "+slicerbutton[deck]);
           } else {
               print("slicer already scheduled, not doing anything");
           }
	}
};

// This handles the eight performance pads below the jog-wheels 
// that deal with rolls or beat loops.
PioneerDDJSX2.RollPerformancePad = function(performanceChannel, control, value, status) 
{
	var deck = performanceChannel - 6;  
	var group = '[Channel' + deck +']';
	var interval = PioneerDDJSX2.settings.loopIntervals[control - 0x10 + rollPrec[performanceChannel-7]];
        
	if (value == 0x7F)
	{
		engine.setValue(group, 'beatlooproll_' + interval + '_activate', 1);
	}
	else
	{
		engine.setValue(group, 'beatlooproll_' + interval + '_activate', 0);
	}
	
	midi.sendShortMsg(0x97 + deck - 1, control, (value==0x7f)?(PioneerDDJSX2.settings.rollColors[rollPrec[performanceChannel-7]]):(0x00));
};

// This handles the cue loop thingy.
PioneerDDJSX2.HotCueLoop = function(performanceChannel, control, value, status) 
{
	var deck = performanceChannel - 6;  
	var group = '[Channel' + deck +']';
	var interval = PioneerDDJSX2.settings.loopIntervals[control - 0x40 + 2];
        
	if (value == 0x7F)
	{
            if (!HCLOn[deck]) {
                            engine.setValue(group, 'hotcue_'+(control - 0x3f)+'_activate', 1);
                            HCLOn[deck]=1;
                            HCLNum[deck]=(control-0x40);
		engine.beginTimer(20, function() {engine.setValue(group, 'beatloop_0.25_activate', 1);}, 1);
            } else {
		engine.setValue(group, 'beatlooproll_0.25_activate', 0);
                HCLOn[deck]=0;
                midi.sendShortMsg(0x96+deck, 0x40+HCLNum[deck], 0x7f);
                midi.sendShortMsg(0x96+deck, 0x48+HCLNum[deck], 0x7f);
            }
	}
	
	//midi.sendShortMsg(0x97 + deck - 1, control, 0x7f);
};

// This handles saving loops.
PioneerDDJSX2.SavedLoop = function(performanceChannel, control, value, status) 
{
	var deck = performanceChannel - 6;
	var group = '[Channel' + deck +']';
	/*var interval = PioneerDDJSX2.settings.loopIntervals[control - 0x40 + 2];
        
	if (value == 0x7F)
	{
                            engine.setValue(group, 'hotcue_'+(control - 0x3f)+'_activate', 1);
		engine.beginTimer(20, function() {engine.setValue(group, 'beatloop_0.25_activate', 1);}, 1);
	}
	else
	{
		engine.setValue(group, 'beatlooproll_0.25_activate', 0);
	}*/
        if (value == 0x7F) {
            if (engine.getValue(group,"hotcue_"+((control-0x48)*2)+"_position")==-1) {
            if (engine.getValue(group,"loop_start_position")!=-1 && engine.getValue(group,"loop_end_position")!=-1) {
                engine.setValue(group,"hotcue_"+((control-0x48)*2)+"_set",1);
                engine.setValue(group,"hotcue_"+(((control-0x48)*2)+1)+"_set",1);
                engine.setValue(group,"hotcue_"+((control-0x48)*2)+"_position",engine.getValue(group,"loop_start_position"));
                engine.setValue(group,"hotcue_"+(((control-0x48)*2)+1)+"_position",engine.getValue(group,"loop_end_position"));
                 
                print("make true");
            }
            } else {
                print("retrieve loop");
                engine.setValue(group,"loop_start_position",engine.getValue(group,"hotcue_"+((control-0x48)*2)+"_position"));
                engine.setValue(group,"loop_end_position",engine.getValue(group,"hotcue_"+(((control-0x48)*2)+1)+"_position"));
                engine.setValue(group,"reloop_exit",1);
            }
        }
        //PioneerDDJSX2.SavedLoopLights(deck,group);
	//midi.sendShortMsg(0x97 + deck - 1, control, 0x7f);
};

// This handles saving loops.
PioneerDDJSX2.ClearSavedLoop = function(performanceChannel, control, value, status)
{
    var deck = performanceChannel - 6;
	var group = '[Channel' + deck +']';
        
        if (value == 0x7F) {
            print("ok");
            print(((control-0x50)*2));
            engine.setValue(group,"hotcue_"+((control-0x50)*2)+"_clear",1);
                engine.setValue(group,"hotcue_"+(((control-0x50)*2)+1)+"_clear",1);
        }
};

// Handles the rotary selector for choosing tracks, library items, crates, etc.
PioneerDDJSX2.RotarySelector = function(channel, control, value, status) 
{
	var delta = 0x40 - Math.abs(0x40 - value);
	var isCounterClockwise = value > 0x40;
	if (isCounterClockwise)
	{
		delta *= -1;
	}
	
	var tracklist = PioneerDDJSX2.enumerations.rotarySelector.targets.tracklist;
	var libraries = PioneerDDJSX2.enumerations.rotarySelector.targets.libraries;
	
	switch(PioneerDDJSX2.status.rotarySelector.target)
	{
		case tracklist:
			engine.setValue('[Playlist]', 'SelectTrackKnob', delta);
			break;
		case libraries:
			if (delta > 0)
			{
				engine.setValue('[Playlist]', 'SelectNextPlaylist', 1);
			}
			else if (delta < 0)
			{
				engine.setValue('[Playlist]', 'SelectPrevPlaylist', 1);
			}
			
			break;
	}
};

PioneerDDJSX2.RotarySelectorClick = function(channel, control, value, status) 
{
	// Only trigger when the button is pressed down, not when it comes back up.
	if (value == 0x7F)
	{
		var target = PioneerDDJSX2.enumerations.rotarySelector.targets.tracklist;
		
		var tracklist = PioneerDDJSX2.enumerations.rotarySelector.targets.tracklist;
		var libraries = PioneerDDJSX2.enumerations.rotarySelector.targets.libraries;
		
		switch(PioneerDDJSX2.status.rotarySelector.target)
		{
			case tracklist:
				target = libraries;
				break;
			case libraries:
				target = tracklist;
				break;
		}
		
		PioneerDDJSX2.status.rotarySelector.target = target;
	}
};

PioneerDDJSX2.shutdown = function()
{
	//PioneerDDJSX2.BindControlConnections(true);
	
	// Reset the VU meters so that we're not left with
	// it displaying something when nothing is playing.
	/*PioneerDDJSX2.vuMeter(0, '[Channel1]', 'VuMeter');
	PioneerDDJSX2.vuMeter(0, '[Channel2]', 'VuMeter');
	PioneerDDJSX2.vuMeter(0, '[Channel3]', 'VuMeter');
	PioneerDDJSX2.vuMeter(0, '[Channel4]', 'VuMeter');*/
        
        // reset ALL leds
        /*for (var k = 0; k < 16; k++) {
        for (var jjj = 0; jjj < 255; jjj++)
	{
            midi.sendShortMsg(0x90 + k, jjj, 0x00);
        }
        }*/
        midi.sendShortMsg(0xbb, 0, 0);
        midi.sendShortMsg(0xbb, 1, 0);
        midi.sendShortMsg(0xbb, 2, 0);
        midi.sendShortMsg(0xbb, 3, 0);
        midi.sendShortMsg(0xbb, 4, 0);
        midi.sendShortMsg(0xbb, 5, 0);
        midi.sendShortMsg(0xbb, 6, 0);
        midi.sendShortMsg(0xbb, 7, 0);
};

