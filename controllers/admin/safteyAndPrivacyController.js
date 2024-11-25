let SettingModel = require('../../models/settingsModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')




exports.add_section = async (req, res) => {
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



exports.get_sections = async (req, res) => {
  try {
    const sections = await SettingModel.find();
    return res.status(200).json(successResponse('Sections fetched successfully', sections));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse('Something went wrong', error.message));
  }
};



exports.get_section_by_id = async (req, res) => {
  try {
    const id = req.query.sectionId;

    if (!id) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide section Id in the query params')) }

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





exports.update_section = async (req, res) => {
  try {
    const id = req.body.sectionId;
    const { section, pages } = req.body;

    if (!id) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide section Id which you want to update in the body'))
    }

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




exports.delete_section = async (req, res) => {
  try {
    const id = req.query.sectionId;

    if (!id) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide section Id "))
    }

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





exports.add_page_to_section = async (req, res) => {
  try {
    const id = req.body.sectionId
    const { title, content, slug } = req.body;

    if (!id) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide section Id in the body")) }
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




exports.delete_page = async (req, res) => {
  try {
    let pageId = req.query.pageId

    if (!pageId) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide pageId in the query params"))
    }

    const deletePage = await SettingModel.findOneAndUpdate(
      { 'pages._id': pageId },
      { $pull: { pages: { _id: pageId } } },
      { new: true }
    );

    if (!deletePage) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Page not found or already deleted."))
    }

    return res.status(200).json(successResponse("Selected page deleted successfully", deletePage))

  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}


