let SettingModel = require('../../models/settingsModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let userModel = require("../../models/userModel")



exports.addSection = async (req, res) => {
    try {
      const { section, pages } = req.body;
  
      if (!section) {
        return res.status(400).json(errorResponse('Section name is required'));
      }
  
      const newSection = new SettingModel({ section, pages });
      await newSection.save();
  
      return res.status(201).json(successResponse('Section added successfully', newSection));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
  };



  exports.getSections = async (req, res) => {
    try {
      const sections = await SettingModel.find();
      return res.status(200).json(successResponse('Sections fetched successfully', sections));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse('Something went wrong', error.message));
    }
  };
  


  exports.getSectionById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const section = await SettingModel.findById(id);
      if (!section) {
        return res.status(404).json(errorResponse('Section not found'));
      }
  
      return res.status(200).json(successResponse('Section fetched successfully', section));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse('Something went wrong', error.message));
    }
  };
  


  exports.updateSection = async (req, res) => {
    try {
      const { id } = req.params;
      const { section, pages } = req.body;
  
      const updatedSection = await SettingModel.findByIdAndUpdate(id, { section, pages }, { new: true });
      if (!updatedSection) {
        return res.status(404).json(errorResponse('Section not found'));
      }
  
      return res.status(200).json(successResponse('Section updated successfully', updatedSection));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse('Something went wrong', error.message));
    }
  };
  



  exports.deleteSection = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedSection = await SettingModel.findByIdAndDelete(id);
      if (!deletedSection) {
        return res.status(404).json(errorResponse('Section not found'));
      }
  
      return res.status(200).json(successResponse('Section deleted successfully'));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse('Something went wrong', error.message));
    }
  };
  




  exports.addPageToSection = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, slug } = req.body;
  
      if (!title || !content || !slug) {
        return res.status(400).json(errorResponse('All fields are required for the page'));
      }
  
      const section = await SettingModel.findById(id);
      if (!section) {
        return res.status(404).json(errorResponse('Section not found'));
      }
  
      section.pages.push({ title, content, slug });
      await section.save();
  
      return res.status(201).json(successResponse('Page added to section', section));
    } catch (error) {
      console.error('ERROR::', error);
      return res.status(500).json(errorResponse('Something went wrong', error.message));
    }
  };
  