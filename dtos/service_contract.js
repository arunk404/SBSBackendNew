class ServiceContractDTO {
    constructor(params) {
      this.service_id = params.id;
      this.id = params.contract_id;
      this.wartungsdatum = params.wartungsdatum;
      this.bezeichnung = params.bemerkungen;
      this.name_sachkundiger = params.userId;
       this.fortschritt = params.progress === null ? 0 : params.progress;
	   if(params.signation!='' && params.employee_signature!='')
	   {
			this.has_both_signatures = true;
	   }
	   if(params.signation==null || params.employee_signature==null)
	   {
		 this.has_both_signatures = false;
	   }
	   if((!params.signation) || (!params.employee_signature))
	   {
			this.has_both_signatures = false;
	   }
	  if(params.checklist_report!=null)
	  {
				// var installationsIdArray = [];
				// if(params.baugruppe_installation_ids != null && params.baugruppe_installation_ids != ""){
				// 	var installations_id_list = params.baugruppe_installation_ids
				// 	installationsIdArray = installations_id_list.split(',').map(id => parseInt(id.trim()));;
				// }
				this.all_signed = true;
				let report = JSON.parse(params.checklist_report);
				let reportLen = report.length;
				let elCounter = 0;
				
				report.forEach(element => {
					if(element.signature_status === true && element.progress>=99){
						elCounter ++;
					}
				});
				this.all_signed = (reportLen === elCounter);
				if(this.all_signed){
					this.fortschritt = 100;
				}
		//if(installationsIdArray.length > 0) this.all_signed = false;
	  }
	  else{
	  	this.all_signed = false;
	  }
    }
}
  
class ServiceContractNoteDTO {
  constructor(params) {
    this.noteid = params.id;
    this.note = params.notes;
    this.createdBy = params.PK_EMAIL;
    this.createdAt = params.createdAt;
  }
}

class ServiceContractImageDTO {
  constructor(params) {
    this.imageid = params.id;
    this.image = params.images;
	this.title = params.title;
    this.createdBy = params.PK_EMAIL;
    this.createdAt = params.createdAt;
  }
}

module.exports = { ServiceContractDTO, ServiceContractNoteDTO, ServiceContractImageDTO};
