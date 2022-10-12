import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '../contexts/roomContext';
import { CameraState, PlayerState } from '../../schemas';
import SceneContainer, { useScene } from 'babylonjs-hook';
import Planets from './Planets';
import SpaceShip from './SpaceShip';
import {
  Scene,
  Vector3,
  HemisphericLight,
  PointLight,
  ArcRotateCamera,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  CubeTexture,
  Texture,
  ActionManager
} from '@babylonjs/core';

function SceneComponent() {

  const roomCtx = useContext(RoomContext);

  type PlayerInfo = {
    sessionId: string,
    player: PlayerState
  }

  const { state, sessionId } = roomCtx!.room!;
  const cameraState = state.cameras.get(sessionId)!;

  const playerArr: PlayerInfo[] = [];

  state.players.forEach((player: PlayerState, sessionId: string) => {
    playerArr.push({ player, sessionId });
  });

  const onSceneReady = (scene: Scene) => {
    scene.clearColor = new Color4(0, 0, 0, 1);

    const light = new HemisphericLight('light', Vector3.Up(), scene);
    light.intensity = 0.5;
    light.groundColor = Color3.Blue();

    const sunLight = new PointLight('sunLight', Vector3.Zero(), scene);
    sunLight.intensity = 2;

    const { alpha, beta, radius, position: { x, y, z } } = cameraState;
    const camera = new ArcRotateCamera('camera', alpha, beta, radius, new Vector3(x, y, z), scene);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    const skyMaterial = new StandardMaterial('skyMaterial', scene);
    skyMaterial.reflectionTexture = new CubeTexture('assets/images/skybox/skybox', scene);
    skyMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMaterial.specularColor = Color3.Black();
    skyMaterial.diffuseColor = Color3.Black();
    skyMaterial.backFaceCulling = false;

    const skyBox = MeshBuilder.CreateBox('skyBox', { size: 1000 }, scene);
    skyBox.infiniteDistance = true;
    skyBox.material = skyMaterial;

    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);

    scene.actionManager = new ActionManager(scene);
  }

  const spaceShips = playerArr.map((info: PlayerInfo, i: number) => {
    console.log('index:', i)
    return (
      <SpaceShip
        key={i}
        sessionId={info.sessionId}
        playerState={info.player}
      />
    );
  });

  return (
    <SceneContainer
      id='canvas'
      antialias
      onSceneReady={onSceneReady}
      renderChildrenWhenReady
    >
      <Planets />
      {spaceShips}
    </SceneContainer>
  );
}

export default SceneComponent;
