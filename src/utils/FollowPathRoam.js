/*
 * @Author: WouRaoyu
 * @Date: 2021-09-04 11:45:25
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 17:08:37
 * @Description: file content
 * @FilePath: \WebUtils\DTDemo\src\utils\FollowPathRoam.js
 * @Copyright (c) : 2021 VrLab
 */

import * as Cesium from "cesium"

function getCameraViewPoint(viewer) {
    var camera = viewer.scene.camera;
    var position = Cesium.Cartesian3.clone(camera.position)
    var cameraHPR = {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
    };
    return {
        position: position,
        orientation: cameraHPR
    };
}

function flyToViewPoint(viewer, viewPoint, duration, callback) {
    debugger;
    viewer.scene.camera.flyTo({
        destination: viewPoint.position,
        orientation: viewPoint.orientation,
        easingFunction: Cesium.EasingFunction.LINEAR_NONE,
        duration: duration,
        complete: callback
    });
}

class RoamControl {
    constructor(viewer) {
        if (RoamControl.instance) {
            return RoamControl.instance;
        }
        this._next = 0;
        this._state = false;
        this._viewer = viewer;
        this._timeout = undefined;
        this._laststop = undefined;
        this._lasttime = undefined;
        this._resource = undefined;
        this._timepassed = 0.0;
    }

    keyBind() {
        document.onkeyup = (event) => {
            switch (event.code) {
                case "Space":
                    if (this._state) {
                        this.stopMapRoam()
                    } else {
                        this.startMapRoam()
                    }
                    break;
                default:
                    break;
            }
        }
    }

    keyRelease() {
        document.onkeyup = undefined;
    }

    startMapRoam(json) {
        var that = this;
        if (json) {
            this._next = 0;
            this._resource = json;
            this._timepassed = 0.0;
        }

        var vpList = this._resource;
        var maxViewPointNum = this._resource.length;
        let duration = vpList[this._next].duration - this._timepassed;
        let startViewPoint = vpList[this._next].ViewPoint;
        if (++that._next === maxViewPointNum) that._next = 0;
        this._state = true;

        // 对当前视点情况进行判断
        let cvp = getCameraViewPoint(this._viewer);
        debugger;
        console.log(startViewPoint.position)
        let dis = Cesium.Cartesian3.distance(cvp.position, startViewPoint.position);
        if (dis < 10) {
            satrtCallback();
        } else {
            this._lasttime = new Date().getTime(); // 每次飞之前都要更新当前时刻
            flyToViewPoint(this._viewer, startViewPoint, duration, satrtCallback);
        }

        function satrtCallback() {
            function callback() {
                let vpnext = vpList[that._next];
                if (vpnext.timeout) {
                    that._timeout = setTimeout(() => { start() }, vpnext.timeout);
                } else {
                    start();
                }
            }

            function start() {
                let vp = vpList[that._next];
                if (++that._next === maxViewPointNum) that._next = 0;
                that._lasttime = new Date().getTime();
                flyToViewPoint(that._viewer, vp.ViewPoint, vp.duration, callback);
            }

            start();
        }
    }

    stopMapRoam() {
        if (this._next > 0) this._next--;
        else this._next = this._resource.length - 1
        this._state = false;
        var scene = this._viewer.scene;
        if (scene && scene.tweens.length > 0) scene.tweens.removeAll();
        let passed = (new Date().getTime() - this._lasttime) / 1000;
        if (this._laststop === this._next - 1) this._timepassed += passed;
        else this._timepassed = passed
        this._laststop = this._next - 1;
        if (!this._timeout) return;
        clearTimeout(this._timeout);
    }
}

RoamControl.getInstance = function (viewer) {
    if (RoamControl.instance) {
        return RoamControl.instance;
    }
    return (RoamControl.instance = new RoamControl(
        viewer
    ));
};

RoamControl.destroyInstance = function () {
    if (RoamControl.instance) {
        RoamControl.instance = null;
    }
};

export { RoamControl, getCameraViewPoint };
