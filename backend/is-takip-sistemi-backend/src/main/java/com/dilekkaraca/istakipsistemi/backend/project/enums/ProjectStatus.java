package com.dilekkaraca.istakipsistemi.backend.project.enums;

public enum ProjectStatus {
    ACTIVE,
    WAITING_APPROVAL,
    READY_FOR_DELIVERY,
    DELIVERED
}
/*
ACTIVE → proje devam ediyor
WAITING_APPROVAL → en az bir stage onay bekliyor
READY_FOR_DELIVERY → tüm stage’ler onaylandı
DELIVERED → yönetici teslim edildi dedi
 */
