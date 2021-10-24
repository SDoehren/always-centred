

export class AlwaysCentredLayer extends PlaceablesLayer {
  constructor() {
    super();
  }

  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "AlwaysCentredLayer",
      canDragCreate: false,
      zIndex: 180
    });
  }

  static documentName = "Note";
}