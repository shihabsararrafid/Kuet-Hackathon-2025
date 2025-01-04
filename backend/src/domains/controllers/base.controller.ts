import { Response } from "express";
import { AppError } from "../../libraries/error-handling/AppError";

export abstract class BaseController {
  protected sendSuccessResponse(res: Response, data?: any): void {
    res.json({
      message: "Success",
      data,
    });
  }

  protected sendErrorResponse(res: Response, error: AppError): void {
    res.status(error.HTTPStatus).json({
      message: error.message,
      error: error.name,
    });
  }
}
