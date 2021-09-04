/*
 * Filename: d:\Project_Web\DTGlobe\src\utils\Drawer\Polygon3d.js
 * Path: d:\Project_Web\DTGlobe
 * Created Date: Saturday, June 13th 2020, 4:45:54 pm
 * Author: WouRaoyu
 * 二点五维多边形绘制
 * Copyright (c) 2020 VrLab
 */

import * as Cesium from "cesium"

function DrawPolyline(viewer, positions) {
    if (positions.length < 2) return;
    var polyline = viewer.entities.add({
        polyline: {
            positions: positions,
            clampToGround: true,
            width: 1,
            material: Cesium.Color.WHITE
        }
    });
    return polyline;
};

function Draw2dPolygon(viewer, pnts) {
    if (pnts.length < 3) return;
    var polygon = viewer.entities.add({
        polygon: {
            hierarchy: pnts,
            material: new Cesium.Color(1.0, 1.0, 0.0, 0.5)
        },
    });
    return polygon;
};

function DrawPoint(viewer, position) {
    return viewer.entities.add({
        position: position,
        point: {
            color: Cesium.Color.WHITE,
            pixelSize: 5,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });
}

class PolygonDrawer {
    constructor(options) {
        if (Cesium.defined(PolygonDrawer.instance)) {
            return PolygonDrawer.instance;
        }
        PolygonDrawer.instance = this
        this._viewer = options.viewer;
        this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);;
        this._drawing = {
            points: new Array(),
            entity: undefined,
        };
        this._path = undefined;
        this._drawn = new Array();
    }

    startPick() {
        this._drawing.points = new Array();
        this._drawing.entity = undefined;
        this._path = undefined;
        const scene = this._viewer.scene;
        this._handler.setInputAction((click) => {
            var pickedFeature = scene.pick(click.position);
            if (!Cesium.defined(pickedFeature)) return;
            if (pickedFeature.id.polygon) {
                if (this._drawing.entity) {
                    this._drawing.entity.polygon.material = new Cesium.Color(1.0, 1.0, 0.0, 0.5)
                }
                if (this._drawing.entity !== pickedFeature.id) {
                    for (let index = 0; index < this._drawn.length; index++) {
                        if (pickedFeature.id === this._drawn[index].entity) {
                            this._drawing = this._drawn[index]
                            this._drawing.entity.polygon.material = new Cesium.Color(0.0, 0.0, 1.0, 0.5)
                            return;
                        }
                    }
                } else {
                    this._drawing.points = new Array();
                    this._drawing.entity = undefined;
                    this._path = undefined;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    startEdit() {
        if (!this._drawing.entity) {
            alert("未选中任何多边形")
            return;
        }
        var entities = new Array()
        const positionEdit = this._drawing.points;
        for (let index = 0; index < positionEdit.length; index++) {
            var dynamicPosition = new Cesium.CallbackProperty(() => {
                return positionEdit[index];
            }, false);
            const pntEntity = DrawPoint(this._viewer, dynamicPosition);
            entities.push(pntEntity)
        }
        let indexPnt = 0;
        this._handler.setInputAction((down) => {
            var pickedFeature = this._viewer.scene.pick(down.position);
            if (!Cesium.defined(pickedFeature) || !pickedFeature.id.point) return;
            this._viewer.scene.screenSpaceCameraController.enableRotate = false;
            var position = pickedFeature.id.position.getValue(
                Cesium.JulianDate.now()
            );
            for (let index = 0; index < positionEdit.length; index++) {
                if (position.equals(positionEdit[index])) break;
                indexPnt += 1;
            }

            this._handler.setInputAction((movement) => {
                var newPosition = this._viewer.scene.pickPosition(movement.endPosition);
                if (Cesium.defined(newPosition)) {
                    positionEdit.splice(indexPnt, 1, newPosition);
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._handler.setInputAction(() => {
            indexPnt = 0;
            this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        this._handler.setInputAction(() => {
            this._viewer.scene.screenSpaceCameraController.enableRotate = true;
            if (this._drawing.entity) {
                this._drawing.entity.polygon.material = new Cesium.Color(1.0, 1.0, 0.0, 0.5)
            }
            entities.forEach(element => {
                this._viewer.entities.remove(element)
            });
            this._drawing.points = new Array();
            this._drawing.entity = undefined;
            this._path = undefined;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    startDraw() {
        this._drawing.points = new Array();
        this._drawing.entity = undefined;
        this._path = undefined;
        const scene = this._viewer.scene;
        // 获取鼠标实时移动点
        this._handler.setInputAction((movement) => {
            if (this._drawing.points.length > 0) {
                var newPosition = scene.pickPosition(movement.endPosition);
                if (Cesium.defined(newPosition)) {
                    this._drawing.points.splice(-2, 1, newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 左键单击绘制线 添加点
        this._handler.setInputAction((click) => {
            var earthPosition = scene.pickPosition(click.position);
            var dynamicPositions = undefined;
            if (Cesium.defined(earthPosition)) {
                if (this._drawing.points.length === 0) {
                    // 将第一个点作为起点和终点
                    this._drawing.points.push(earthPosition);
                    dynamicPositions = new Cesium.CallbackProperty(() => {
                        return this._drawing.points;
                    }, false);
                    this._path = DrawPolyline(this._viewer, dynamicPositions);
                    this._drawing.points.push(earthPosition);
                }
                this._drawing.points.splice(-2, 0, earthPosition);
                if (this._drawing.points.length === 4) {
                    const pointsLocal = this._drawing.points
                    dynamicPositions = new Cesium.CallbackProperty(() => {
                        return new Cesium.PolygonHierarchy(pointsLocal);
                    }, false);
                    this._drawing.entity = Draw2dPolygon(this._viewer, dynamicPositions);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 左键双击取消绘制
        this._handler.setInputAction(() => {
            this.deletePath();
            this.deletePolygon();
            this._drawing.points = new Array();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // 右键单击结束绘制
        this._handler.setInputAction(() => {
            this.deletePath();
            this._drawn.push(this._drawing);
            this._drawing = {
                points: new Array(),
                path: undefined,
                polygon: undefined,
            };
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    stop() {
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    deletePath() {
        this._viewer.entities.remove(this._path);
        this._path = undefined;
    }

    deletePolygon() {
        this._viewer.entities.remove(this._drawing.entity);
        this._drawing.entity = undefined;
    }
}

export { PolygonDrawer, Draw2dPolygon }