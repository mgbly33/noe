package com.example.demo.service;

import com.example.demo.model.Order;

import com.example.demo.model.Product;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 导出服务类，负责生成 Excel 文件。
 */
@Service
public class ExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 导出订单列表为 Excel
     * 
     * @param orders 订单列表
     * @return Excel 文件输入流
     */
    public ByteArrayInputStream exportOrders(List<Order> orders) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("订单列表");

            // 创建表头
            String[] headers = { "订单编号", "买家名称", "总金额", "状态", "创建时间" };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // 填充数据
            int rowIdx = 1;
            for (Order order : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(order.getOrderNo());
                row.createCell(1).setCellValue(order.getBuyerName());
                row.createCell(2).setCellValue(order.getTotalAmount().doubleValue());
                row.createCell(3).setCellValue(order.getStatus().getDisplayName());
                row.createCell(4).setCellValue(order.getCreatedAt().format(DATE_FORMATTER));
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Excel 生成失败: " + e.getMessage());
        }
    }

    /**
     * 导出商品列表为 Excel
     * 
     * @param products 商品列表
     * @return Excel 文件输入流
     */
    public ByteArrayInputStream exportProducts(List<Product> products) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("商品列表");

            String[] headers = { "ID", "名称", "分类", "标准价格", "促销价格", "库存", "是否促销" };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            int rowIdx = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(product.getId());
                row.createCell(1).setCellValue(product.getName());
                row.createCell(2).setCellValue(product.getCategory() != null ? product.getCategory().getName() : "");
                row.createCell(3).setCellValue(product.getStandardPrice().doubleValue());
                row.createCell(4).setCellValue(
                        product.getPromotionPrice() != null ? product.getPromotionPrice().doubleValue() : 0);
                row.createCell(5).setCellValue(product.getStock());
                row.createCell(6).setCellValue(product.getIsOnPromotion() ? "是" : "否");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Excel 生成失败: " + e.getMessage());
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

}
