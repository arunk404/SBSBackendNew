const { body } = require('express-validator');

const userCreationValidate = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
  body('email').notEmpty().isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('roleId').notEmpty().withMessage('Role is Required'),
];

const userUpdationValidate = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
  body('email').notEmpty().isEmail().withMessage('Invalid email format'),
  body('roleId').notEmpty().withMessage('Role is Required'),
];

const userUpdationValidateForProfile = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
];

const loginValidate = [
  body('email').notEmpty().isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password required'),
];

const createInstallationValidate = [
  // body('kundennummer').notEmpty().withMessage('Kunden_nr required'),
  body('kundenname').notEmpty().withMessage('Kunden Name Required'),
];

const createServiceContractValidate = [
  body('installation_id').notEmpty().withMessage('Objekt is Required'),
  body('contract_id').notEmpty().withMessage('Contract Nr is required'),
  body('wartungsdatum')
    .notEmpty().withMessage('Wartungsdatum is required')
    .custom((value) => {
      // Use a custom function to check if 'wartungsdatum' is a valid date
      if ((/^\d{2}.\d{2}.\d{4}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      }else{
        throw new Error('Wartungsdatum must be a valid date in the format YYYY-MM-DD');
      }
      return true;
    }),
];

const createBaugruppeValidate = [
  body('bgnr').notEmpty().withMessage('Baugruppe Nr required'),
  body('baugruppe').notEmpty().withMessage('Baugruppe required'),
];

const createBauelementValidate = [
  body('bauelement').notEmpty().withMessage('Bauelement required'),
];

const updateReportValidate = [
  body('bemerkung').notEmpty().withMessage('Bemerkung required'),
  body('sort_by').isNumeric().withMessage('Sort By must be a number'),
];


const createServiceContractMeta = [
  body('serviceContractId').notEmpty().withMessage('Service Contract Number is required!'),
  body('notes').notEmpty().isString().withMessage('Note field is required!'),
];

const createbauelementbaugruppe = [
  body('baugruppe_id').notEmpty().withMessage('Baugruppe is Required'),
  body('bauelement_id').notEmpty().withMessage('Bauelement is Required'),
  body('tatigkeit').notEmpty().withMessage('Tatigkeit is Required'),
];

const createbauelementbaugruppeWithNewElement = [
  body('baugruppe_id').notEmpty().withMessage('Baugruppe is Required'),
  body('bauelement').notEmpty().withMessage('Bauelement is Required'),
  body('tatigkeit').notEmpty().withMessage('Tatigkeit is Required'),
];


const createBaugruppeNewItemValidate = [
  body('bgnr').notEmpty().withMessage('Baugruppe Nr is required'),
  body('baugruppe').notEmpty().withMessage('Baugruppe is required'),
  body('baugruppe_nr').notEmpty().withMessage('Baugruppe Id is required'),
  body('kunden_nr').notEmpty().withMessage('Kunden Nr is required'),
];

const createServiceContractMetaImg = [
  body('s_id').notEmpty().withMessage('Service Contract Nr is required'),
  body('images').notEmpty().withMessage('Image File is required'),
];

const reportEmail = [
  body('id').notEmpty().withMessage('Report Id is required'),
  body('email1').notEmpty().withMessage('Email One is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
];

const sendemail = [
  body('email1').notEmpty().withMessage('Email One is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('file').notEmpty().withMessage('File is required'),
]

const MachineServiceContractValidate = [
  // body('kundennummer').notEmpty().withMessage('Kunden_nr required'),
  body('bemerkungen').notEmpty().withMessage('bemerkungen Name Required'),
];

const updateMetaImageValidate = [
  body('id').notEmpty().withMessage('Image Nr is required'),
  body('title').notEmpty().withMessage('Image title is required'),
];

module.exports = 
{ userCreationValidate,
  userUpdationValidate,
  loginValidate,
  createInstallationValidate,
  createServiceContractValidate,
  createBaugruppeValidate,
  createBauelementValidate,
  updateReportValidate,
  createServiceContractMeta,
  createbauelementbaugruppe,
  createbauelementbaugruppeWithNewElement,
  createBaugruppeNewItemValidate,
  createServiceContractMetaImg,
  reportEmail,
  sendemail,
  MachineServiceContractValidate,
  userUpdationValidateForProfile,
  updateMetaImageValidate,
};