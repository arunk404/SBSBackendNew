class MachineDTO {
    constructor(params) 
    {
        this.baugruppe_nr = params.id;
        // this.baugruppe_nr = params.baugruppe_nr;
        this.baugruppe = params.baugruppe;
        this.bgnr = params.bgnr;
        // this.createdAt = params.createdAt;
    }
}

class MachineInstallationDTO {
    constructor(params) {
      this.baugruppe_nr = params.BaugruppeInstallationsId;

      this.bgnr = params.bgnr;
      this.baugruppe = params.baugruppe;
      this.hinweis_letzte_sv = params.hinweis_letzte_sv;
      this.hinweis_letzte_sv1 = params.hinweis_letzte_sv1;
      this.progress = params.progress;
    }
}

class MachineInstallationWithSignatureDTO {
  constructor(params) {
    console.log(params);
    this.baugruppe_nr = params.BaugruppeInstallationsId;
	
    this.bgnr = params.bgnr;
    this.baugruppe = params.baugruppe;
    this.hinweis_letzte_sv = params.hinweis_letzte_sv;
    this.hinweis_letzte_sv1 = params.hinweis_letzte_sv1;
    
	this.progress = params.progress;
    this.signature = false;
    if (params.report !== undefined && params.report !== null && params.report !== '') {
      let report = JSON.parse(params.report);
      if(report != null){
        report.forEach(element => {
          if(element.baugruppe_id == params.id){
            this.signature = element.signature_status; 
          }
        });
      }
    }
	this.bemerkungen = params.bemerkungen;
  }
}

class Baugruppelist {
  constructor(params,isNew) {
    this.baugruppe_nr = params.id;
    this.baugruppe = params.baugruppe;
    this.bgnr = params.bgnr;
    this.isnew = isNew;
  }
}


class MachineInstallationDTO_Id {
  constructor(params) {
    this.baugruppe_nr = params.BaugruppeInstallationsId;
  }
}


module.exports = {MachineDTO , MachineInstallationDTO , MachineInstallationWithSignatureDTO , MachineInstallationDTO_Id , Baugruppelist};