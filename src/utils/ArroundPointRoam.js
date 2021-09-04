/*
 * @Author: WouRaoyu
 * @Date: 2021-09-04 09:37:49
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 11:18:22
 * @Description: file content
 */

import {
    Cartesian3,
    Matrix4,
    HeadingPitchRange,
    defined
} from "cesium"

class ArroundPointRoam {
    constructor(viewer) {
        if (defined(ArroundPointRoam.instance)) {
            return ArroundPointRoam.instance;
        }
        ArroundPointRoam.instance = this;
        this._viewer = viewer;
        this._distance = undefined;
        this._interval = undefined;
        this._hprange = undefined;
        this._step = undefined;
    }

    create(options) {
        this._center = options.center;
        this._initview = options.initview;
        this._duration = options.duration;

        this._step = 2 * Math.PI / (this._duration * 50);
        let pnta = this._center;
        let pntb = this._initview.position;
        this._distance = Cartesian3.distance(pnta, pntb);
        let heading = this._initview.orientation.heading;
        let pitch = this._initview.orientation.pitch;
        this._hprange = new HeadingPitchRange(heading, pitch, this._distance);
    }

    start() {
        this._viewer.camera.lookAt(this._center, this._hprange);
        this._interval = setInterval(() => {
            this._viewer.camera.rotateLeft(this._step)
        }, 20);
    }

    stop() {
        clearInterval(this._interval);
        this._viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        this._interval = undefined;
    }
}

export { ArroundPointRoam }