class InstalltionDTO {
    constructor(parse) {
      this.id = parse.id;
      this.objekt_nr = parse.kunden_nr;
      // this.project_nr = parse.project_nr;
      this.objekt = parse.kunde;
      // this.objekt = parse.kunde_erp;
      this.bemerkungen = parse.bemerkungen;
      // this.strabe = parse.strabe;
      // this.plz = parse.plz;
      // this.ort = parse.ort;
      // this.tel = parse.tel;
      // this.fax = parse.fax;
      // this.email = parse.email;
      // this.jhare = parse.jhare;
      // this.createdAt = parse.createdAt;
    }
  }

module.exports = InstalltionDTO;
