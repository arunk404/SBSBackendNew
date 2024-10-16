class ChecklistRecords {
    constructor(params) {
      this.be_nr = params.id;
      this.baugruppe_id = params.baugruppe_id;
      this.bgnr = params.bgnr;
      this.baugruppe = params.baugruppe;
      this.hinweis_letzte_sv = params.hinweis_letzte_sv;
      this.bauelement = params.bauelement;
      this.tatigkeit = params.tatigkeit;
      this.bemerkung = params.bemerkung;
      if (typeof params.progress !== 'undefined' && params.progress !== null) {
        this.progress = params.progress;
      }
      this.baugruppe_nr = params.baugruppe_installation_id;
    }
}

class ChecklistHeader {
    constructor(params) {
        this.contract_id = params.contract_id;
        this.kunde = params.kunde;
        this.wartungsdatum = params.wartungsdatum;
        this.bemerkungen = params.bemerkungen;
    }
}

class getAllReportsList {
    constructor(params) {
      this.id = params.id;
      this.reporttype_id = params.report_type_id;
      this.reporttitle = params.title;
    //   this.generateddate = params.createdAt;
    }
}
  
module.exports = { ChecklistRecords, ChecklistHeader, getAllReportsList};