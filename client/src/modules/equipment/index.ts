import equipmentService from './equipmentService';
import equipmentReducer, {
  fetchEquipmentList,
  fetchEquipmentDetails,
  addNewEquipment,
  updateExistingEquipment,
  assignEquipmentToUser,
  unassignEquipmentFromUser,
  setFilters,
  clearSelectedEquipment,
  resetFilters
} from './equipmentSlice';
import {
  Equipment,
  EquipmentType,
  EquipmentStatus,
  EquipmentFilters,
  AddEquipmentPayload,
  UpdateEquipmentPayload,
  AssignEquipmentPayload
} from './types';

export {
  equipmentService,
  fetchEquipmentList,
  fetchEquipmentDetails,
  addNewEquipment,
  updateExistingEquipment,
  assignEquipmentToUser,
  unassignEquipmentFromUser,
  setFilters,
  clearSelectedEquipment,
  resetFilters,
  EquipmentType,
  EquipmentStatus
};

export type {
  Equipment,
  EquipmentFilters,
  AddEquipmentPayload,
  UpdateEquipmentPayload,
  AssignEquipmentPayload
};

export default equipmentReducer;