class ElementDTO {
    constructor(params) {
      this.bauelement_nr = params.id;
    //   this.be_nr = params.be_nr;
      this.bauelement = params.bauelement;
      // this.createdAt = params.createdAt;
    }
}
class MachineELementDTO {
    constructor(params) {
        this.be_nr = params.report_id;
		this.sort_by = params.sort_by;
        this.bauelement = params.bauelement;
        this.tatigkeit = params.tatigkeit;
        this.bemerkung = params.bemerkung;
        this.updated_status = params.updatedStatus;
    }
}

class MachineELementOfflineDTO {
  constructor(params) {
    this.be_nr = params.report_id;
    this.baugruppe_id = params.baugruppe_id;
    this.bauelement = params.bauelement;
    // this.bauelement_id = params.bauelement_id;
    this.tatigkeit = params.tatigkeit;
    this.bemerkung = params.bemerkung;
    // this.interne_bemerkungen = params.interne_bemerkungen;
    // this.createdAt = params.createdAt;
  }
}

class TatigkeitDTO {
  constructor(params) {
    this.tatigkeit = params.tatigkeit;
  }
}

module.exports = { ElementDTO, MachineELementDTO, MachineELementOfflineDTO, TatigkeitDTO };
